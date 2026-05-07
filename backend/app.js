const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('./Database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',  // 👈 ТВОЙ ФРОНТЕНД
  credentials: true,                 // 👈 РАЗРЕШАЕМ КУКИ
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

const db = Database.getInstance();

db.testConnection();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

const requireParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ error: 'Доступ только для родителей' });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Доступ только для учеников' });
  }
  next();
};


const requireAccessToStudent = async (req, res, next) => {
  const { studentId } = req.params;
  
  if (req.user.role === 'student' && req.user.userId === parseInt(studentId)) {
    return next();
  }
  
  if (req.user.role === 'parent') {
    const check = await db.query(
      'SELECT 1 FROM parent_child WHERE parent_id = $1 AND student_id = $2 AND invitation_status = $3',
      [req.user.userId, studentId, 'accepted']
    );
    if (check.rows.length > 0) return next();
  }
  
  res.status(403).json({ error: 'Нет доступа к этому ученику' });
};

app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, role, grade } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  if (!['student', 'parent'].includes(role)) {
    return res.status(400).json({ error: 'Неверная роль' });
  }

  try {
    const existingUser = await db.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, full_name, role, grade) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
      [email, hashedPassword, fullName, role, grade || null]
    );

    const userId = result.rows[0].user_id;

    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      { expiresIn: '7d' }
    );

    await db.query(
      `INSERT INTO user_refresh_tokens (user_id, token, expires_at) 
      VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [userId, refreshToken]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      accessToken,
      userId,
      role,
      message: 'Регистрация успешна'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const result = await db.query(
      'SELECT user_id, email, password_hash, full_name, role, grade FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '15m' }  
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      { expiresIn: '7d' }
    );

    await db.query(
      `INSERT INTO user_refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.user_id, refreshToken]
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,   // JavaScript не имеет доступа
      secure: process.env.NODE_ENV === 'production',  // только HTTPS в production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 дней
    });

    res.json({
      accessToken,  // 👈 ТОЛЬКО access token!
      userId: user.user_id,
      role: user.role,
      fullName: user.full_name,
      grade: user.grade
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});


app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token не найден' });
  }

  try {
    const dbResult = await db.query(
      'SELECT user_id FROM user_refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (dbResult.rows.length === 0) {
      return res.status(403).json({ error: 'Refresh token недействителен или истек' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');

    const newAccessToken = jwt.sign(
      { userId: payload.userId, email: payload.email, role: payload.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(403).json({ error: 'Недействительный refresh token' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    // Удаляем refresh token из БД
    await db.query('DELETE FROM user_refresh_tokens WHERE token = $1', [refreshToken]);
  }

  // Очищаем cookie
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT user_id, email, full_name, role, grade, created_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

app.put('/api/auth/me', authenticateToken, async (req, res) => {
  const { fullName, password, grade, currentPassword } = req.body;
  const userId = req.user.userId;

  try {
    if (password) {
      const userResult = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      if (!isValid) {
        return res.status(400).json({ error: 'Неверный текущий пароль' });
      }
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(fullName);
    }

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (grade !== undefined) {
      updates.push(`grade = $${paramIndex++}`);
      values.push(grade);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING user_id, email, full_name, role, grade, created_at`;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM test_questions ORDER BY order_number');
    res.json(result.rows);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Ошибка получения вопросов' });
  }
});

app.post('/api/test/start', authenticateToken, requireStudent, async (req, res) => {  
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ error: 'studentId обязателен' });
  }
  if ( req.user.userId !== parseInt(studentId)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  try {
    const result = await db.query(
      `INSERT INTO test_results (student_id, answers_json, current_question_index, is_completed)
       VALUES ($1, $2, $3, $4) RETURNING test_result_id`,
      [studentId, '{}', 0, false]
    );
    res.json({
      testResultId: result.rows[0].test_result_id,
      studentId,
      currentQuestionIndex: 0,
      isCompleted: false
    });
  } catch (err) {
    console.error('Start test error:', err);
    res.status(500).json({ error: 'Ошибка начала теста' });
  }
});

app.post('/api/test/answer', authenticateToken, async (req, res) => {
  const { testResultId, questionIndex, answer } = req.body;

  if (!testResultId || questionIndex === undefined || !answer) {
    return res.status(400).json({ error: 'testResultId, questionIndex и answer обязательны' });
  }

  try {
    const testResult = await db.query('SELECT * FROM test_results WHERE test_result_id = $1', [testResultId]);
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Результат теста не найден' });
    }

    const currentData = testResult.rows[0];
    const answers = JSON.parse(currentData.answers_json || '{}');
    answers[questionIndex] = answer;
    const updatedAnswersJson = JSON.stringify(answers);
    const nextQuestionIndex = questionIndex + 1;

    await db.query(
      'UPDATE test_results SET answers_json = $1, current_question_index = $2 WHERE test_result_id = $3',
      [updatedAnswersJson, nextQuestionIndex, testResultId]
    );

    res.json({ success: true, nextQuestionIndex });
  } catch (err) {
    console.error('Save answer error:', err);
    res.status(500).json({ error: 'Ошибка сохранения ответа' });
  }
});

app.post('/api/test/finish', authenticateToken, async (req, res) => {
  const { testResultId, natureScore, techniqueScore, humanScore, signScore, artScore, dominantType, dominantTypes  } = req.body;

  if (!testResultId) {
    return res.status(400).json({ error: 'testResultId обязателен' });
  }

  try {
    const testResult = await db.query('SELECT * FROM test_results WHERE test_result_id = $1', [testResultId]);
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Результат теста не найден' });
    }

    await db.query(
      `UPDATE test_results SET
        is_completed = true,
        completed_at = NOW(),
        nature_score = COALESCE($1, 0),
        technique_score = COALESCE($2, 0),
        human_score = COALESCE($3, 0),
        sign_score = COALESCE($4, 0),
        art_score = COALESCE($5, 0),
        dominant_type = $6,
        dominant_types = $7
      WHERE test_result_id = $8`,
      [natureScore, techniqueScore, humanScore, signScore, artScore, dominantType, JSON.stringify(dominantTypes), testResultId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Finish test error:', err);
    res.status(500).json({ error: 'Ошибка завершения теста' });
  }
});

app.get('/api/test/result/:testResultId', authenticateToken, async (req, res) => {
  const { testResultId } = req.params;
  
  try {
    const result = await db.query('SELECT * FROM test_results WHERE test_result_id = $1', [testResultId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Результат не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get test result error:', err);
    res.status(500).json({ error: 'Ошибка получения результата' });
  }
});

app.get('/api/test/history/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await db.query(
      `SELECT test_result_id, completed_at, is_completed, current_question_index,
        nature_score, technique_score, human_score, sign_score, art_score, dominant_type, dominant_types 
       FROM test_results
       WHERE student_id = $1
       ORDER BY completed_at DESC`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Ошибка получения истории' });
  }
});

app.get('/api/professions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM professions ORDER BY title');
    res.json(result.rows);
  } catch (err) {
    console.error('Get professions error:', err);
    res.status(500).json({ error: 'Ошибка получения профессий' });
  }
});

app.get('/api/professions/type/:type', async (req, res) => {
  const { type } = req.params;
  if (!['П', 'Т', 'Ч', 'З', 'Х'].includes(type)) {
    return res.status(400).json({ error: 'Неверный тип профессии' });
  }

  try {
    const result = await db.query('SELECT * FROM professions WHERE profession_type = $1 ORDER BY title', [type]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get professions by type error:', err);
    res.status(500).json({ error: 'Ошибка получения профессий' });
  }
});

app.get('/api/professions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM professions WHERE profession_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Профессия не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profession error:', err);
    res.status(500).json({ error: 'Ошибка получения профессии' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  const { studentId, professionId } = req.body;

  if (!studentId || !professionId) {
    return res.status(400).json({ error: 'studentId и professionId обязательны' });
  }

  try {
    const existing = await db.query(
      'SELECT favorite_id FROM favorite_professions WHERE student_id = $1 AND profession_id = $2',
      [studentId, professionId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Профессия уже в избранном' });
    }

    await db.query(
      'INSERT INTO favorite_professions (student_id, profession_id) VALUES ($1, $2)',
      [studentId, professionId]
    );

    res.json({ success: true, message: 'Добавлено в избранное' });
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ error: 'Ошибка добавления в избранное' });
  }
});

app.delete('/api/favorites/:studentId/:professionId', authenticateToken, async (req, res) => {
  const { studentId, professionId } = req.params;

  try {
    await db.query(
      'DELETE FROM favorite_professions WHERE student_id = $1 AND profession_id = $2',
      [studentId, professionId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ error: 'Ошибка удаления из избранного' });
  }
});

app.get('/api/favorites/:studentId', authenticateToken, async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await db.query(
      `SELECT p.*, f.added_at FROM professions p
       JOIN favorite_professions f ON p.profession_id = f.profession_id
       WHERE f.student_id = $1
       ORDER BY f.added_at DESC`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Ошибка получения избранного' });
  }
});

app.post('/api/parent/reject', authenticateToken, requireParent, async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Токен обязателен' });
  }

  try {
    const result = await db.query(
      'UPDATE parent_child SET invitation_status = $1 WHERE invitation_token = $2 AND invitation_status = $3 RETURNING parent_child_id, student_id',
      ['rejected', token, 'pending']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Приглашение не найдено или уже обработано' });
    }
    
    res.json({ success: true, message: 'Приглашение отклонено' });
  } catch (err) {
    console.error('Reject invitation error:', err);
    res.status(500).json({ error: 'Ошибка отклонения приглашения' });
  }
});

app.delete('/api/parent/child/:parentChildId', authenticateToken, async (req, res) => {
  const { parentChildId } = req.params;

  try {
    const checkResult = await db.query(
      'SELECT parent_id, student_id FROM parent_child WHERE parent_child_id = $1',
      [parentChildId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Связь не найдена' });
    }
    
    const { parent_id, student_id } = checkResult.rows[0];
    if (req.user.userId !== parent_id && req.user.userId !== student_id) {
      return res.status(403).json({ error: 'Нет доступа к этой связи' });
    }
    
    await db.query('DELETE FROM parent_child WHERE parent_child_id = $1', [parentChildId]);
    res.json({ success: true, message: 'Связь удалена' });
  } catch (err) {
    console.error('Unlink error:', err);
    res.status(500).json({ error: 'Ошибка удаления связи' });
  }
});

app.get('/api/student/parents/:studentId', authenticateToken, requireAccessToStudent, async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await db.query(
      `SELECT pc.*, u.full_name, u.email FROM parent_child pc
       JOIN users u ON pc.parent_id = u.user_id
       WHERE pc.student_id = $1 AND pc.invitation_status = 'accepted'`,
      [studentId]
    );

    const parents = result.rows.map(row => ({
      ...row,
      parent_full_name: row.full_name
    }));

    res.json(parents);
  } catch (err) {
    console.error('Get parents error:', err);
    res.status(500).json({ error: 'Ошибка получения родителей' });
  }
});

app.get('/api/parent/invitations', authenticateToken, requireParent, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT pc.*, u.full_name, u.email, u.grade FROM parent_child pc
       JOIN users u ON pc.student_id = u.user_id
       WHERE pc.parent_id = $1
       ORDER BY pc.linked_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get invitations error:', err);
    res.status(500).json({ error: 'Ошибка получения приглашений' });
  }
});

app.get('/api/parent/children', authenticateToken, requireParent, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.user_id, u.email, u.full_name, u.grade, pc.linked_at
       FROM users u
       JOIN parent_child pc ON u.user_id = pc.student_id
       WHERE pc.parent_id = $1 AND pc.invitation_status = 'accepted'
       ORDER BY u.full_name`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get children error:', err);
    res.status(500).json({ error: 'Ошибка получения списка детей' });
  }
});

app.post('/api/parent/invite', authenticateToken, requireStudent, async (req, res) => {
  const { parentEmail } = req.body;

  if (!parentEmail) {
    return res.status(400).json({ error: 'Email родителя обязателен' });
  }

  try {
    const parentResult = await db.query(
      'SELECT user_id FROM users WHERE email = $1 AND role = $2',
      [parentEmail, 'parent']
    );

    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Родитель с таким email не найден' });
    }

    const parentId = parentResult.rows[0].user_id;
    
    const existingAccepted = await db.query(
      'SELECT parent_child_id, invitation_status FROM parent_child WHERE parent_id = $1 AND student_id = $2 AND invitation_status = $3',
      [parentId, req.user.userId, 'accepted']
    );
    
    if (existingAccepted.rows.length > 0) {
      return res.status(409).json({ error: 'Этот родитель уже привязан к вашему аккаунту' });
    }
    
    const existingPending = await db.query(
      'SELECT parent_child_id FROM parent_child WHERE parent_id = $1 AND student_id = $2 AND invitation_status = $3',
      [parentId, req.user.userId, 'pending']
    );
    
    if (existingPending.rows.length > 0) {
      return res.status(409).json({ error: 'Приглашение уже было отправлено. Дождитесь ответа.' });
    }

    const invitationToken = Math.random().toString(36).substring(2, 15) + Date.now();

    await db.query(
      'INSERT INTO parent_child (parent_id, student_id, invitation_token, invitation_status) VALUES ($1, $2, $3, $4)',
      [parentId, req.user.userId, invitationToken, 'pending']
    );

    res.json({ success: true, message: 'Приглашение отправлено' });
  } catch (err) {
    console.error('Send invitation error:', err);
    res.status(500).json({ error: 'Ошибка отправки приглашения' });
  }
});

app.post('/api/parent/accept', authenticateToken, requireParent, async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Токен обязателен' });
  }

  try {
    const result = await db.query(
      'UPDATE parent_child SET invitation_status = $1, linked_at = NOW() WHERE invitation_token = $2 AND parent_id = $3 AND invitation_status = $4 RETURNING student_id',
      ['accepted', token, req.user.userId, 'pending']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Недействительный токен' });
    }

    res.json({ success: true, message: 'Ребёнок успешно привязан' });
  } catch (err) {
    console.error('Accept invitation error:', err);
    res.status(500).json({ error: 'Ошибка принятия приглашения' });
  }
});

app.get('/api/comments/:studentId/:professionId', authenticateToken, requireParent, requireAccessToStudent,  async (req, res) => {
  const { studentId, professionId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM comments WHERE parent_id = $1 AND student_id = $2 AND profession_id = $3',
      [req.user.userId, studentId, professionId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get comment error:', err);
    res.status(500).json({ error: 'Ошибка получения комментария' });
  }
});

app.post('/api/comments', authenticateToken, requireParent, async (req, res) => {
  const { studentId, professionId, text } = req.body;

  if (!studentId || !professionId || text === undefined) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  try {
    const existing = await db.query(
      'SELECT comment_id FROM comments WHERE parent_id = $1 AND student_id = $2 AND profession_id = $3',
      [req.user.userId, studentId, professionId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE comments SET text = $1, updated_at = NOW() WHERE comment_id = $2',
        [text, existing.rows[0].comment_id]
      );
    } else {
      await db.query(
        'INSERT INTO comments (parent_id, student_id, profession_id, text) VALUES ($1, $2, $3, $4)',
        [req.user.userId, studentId, professionId, text]
      );
    }

    res.json({ success: true, message: 'Комментарий сохранён' });
  } catch (err) {
    console.error('Save comment error:', err);
    res.status(500).json({ error: 'Ошибка сохранения комментария' });
  }
});

app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM comments 
       WHERE comment_id = $1 
       AND (parent_id = $2 OR student_id = $2)
       RETURNING comment_id`,
      [commentId, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Нет доступа к этому комментарию' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Ошибка удаления комментария' });
  }
});

app.get('/api/comments/student/:studentId/:professionId', authenticateToken, requireAccessToStudent, async (req, res) => {
  const { studentId, professionId } = req.params;
  try {
    const result = await db.query(
      `SELECT c.*, u.full_name as parent_name 
       FROM comments c
       JOIN users u ON c.parent_id = u.user_id
       WHERE c.student_id = $1 AND c.profession_id = $2`,
      [studentId, professionId]
    );
    
    if (result.rows.length === 0) {
      return res.json(null);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get comment for student error:', err);
    res.status(500).json({ error: 'Ошибка получения комментария' });
  }
});


app.get('/api/users/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      'SELECT user_id, email, full_name, role, grade, created_at FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Ошибка получения пользователя' });
  }
});

// Удалить результат теста
app.delete('/api/test/result/:testResultId', authenticateToken, async (req, res) => {
  const { testResultId } = req.params;
  try {
    const result = await db.query(
      'SELECT student_id FROM test_results WHERE test_result_id = $1',
      [testResultId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Результат не найден' });
    }

    const studentId = result.rows[0].student_id;
    if (req.user.userId !== studentId) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    await db.query('DELETE FROM test_results WHERE test_result_id = $1', [testResultId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete test result error:', err);
    res.status(500).json({ error: 'Ошибка удаления результата' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server доступен по адресу: http://localhost:${PORT}`);
});