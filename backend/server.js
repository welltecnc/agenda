const express = require('express');
const mysql = require('mysql2/promise'); // Usando 'mysql2/promise' para async/await
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


// Configuração do Banco de Dados MySQL (MOCK/Exemplo)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'BDAGENDA'
};

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Permite requisições do frontend Vite
app.use(bodyParser.json());

// --- Conexão e Rotas de Autenticação (Conceitual) ---
/**
 * Em um cenário real, você implementaria um sistema de autenticação
 * (ex: JWT, Sessions) que interage com uma tabela de 'users' no MySQL.
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Lógica de verificação de credenciais e geração de token JWT
  console.log(`Tentativa de login para: ${email}`);
  // ... (Implementação omitida)
  res.status(200).json({ token: 'mock_jwt_token', userId: '123' });
});


// --- Rotas de Compromissos ---

// 1. Obter Todos os Compromissos para um Usuário
app.get('/api/appointments/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // QUERY SQL de exemplo:
    const [rows] = await connection.execute(
      'SELECT * FROM appointments WHERE user_id = ? ORDER BY date_time ASC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao obter compromissos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao carregar dados.' });
  } finally {
    if (connection) connection.end();
  }
});

// 2. Adicionar Novo Compromisso
// Rota POST para adicionar um novo compromisso
app.post('/api/appointments', async (req, res) => {
    const { userId, title, dateTime, description } = req.body; // dateTime é a string ISO

    // ----------------------------------------------------------------
    // CRITICAL FIX: CONVERTER ISO PARA FORMATO MYSQL DATETIME
    // ----------------------------------------------------------------
    
    // 1. Remove os milissegundos e o 'Z' (mantendo apenas YYYY-MM-DDTHH:MM:SS)
    let mysqlDateTime = dateTime.substring(0, 19); 
    
    // 2. Substitui o separador 'T' pelo espaço
    mysqlDateTime = mysqlDateTime.replace('T', ' '); 
    
    // O valor agora é: '2025-11-25 15:33:00', que o MySQL aceita.
    
    // ----------------------------------------------------------------

    const sql = 'INSERT INTO appointments (user_id, title, date_time, description) VALUES (?, ?, ?, ?)';
    const values = [userId, title, mysqlDateTime, description]; // Usamos o mysqlDateTime corrigido

    try {
        const [result] = await pool.execute(sql, values);
        res.status(201).json({ id: result.insertId, message: 'Compromisso adicionado com sucesso.' });
    } catch (error) {
        console.error('Erro ao adicionar compromisso:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar dados.', error: error.sqlMessage });
    }
});


// 3. Atualizar Compromisso (Edição)
app.put('/api/appointments/:id', async (req, res) => {
  // O ID do compromisso está nos parâmetros da URL
  const { id } = req.params;
  // Os novos dados do compromisso estão no corpo da requisição
  const { title, dateTime, description, userId } = req.body; 
  
  // *OPCIONAL: Adicione verificação de segurança aqui, garantindo que o 
  // userId no body/token corresponde ao dono do compromisso 'id'.
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // QUERY SQL: Atualiza os campos na tabela 'appointments'
    const [result] = await connection.execute(
      'UPDATE appointments SET title = ?, date_time = ?, description = ? WHERE id = ?',
      [title, dateTime, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado ou sem alterações.' });
    }

    res.json({ message: 'Compromisso atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar compromisso:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar dados.' });
  } finally {
    if (connection) connection.end();
  }
});

// 4. Excluir Compromisso
app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // QUERY SQL de exemplo:
    const [result] = await connection.execute(
      'DELETE FROM appointments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado.' });
    }

    res.json({ message: 'Compromisso excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir compromisso:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao excluir dados.' });
  } finally {
    if (connection) connection.end();
  }
});



// --- Inicialização do Servidor ---
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});