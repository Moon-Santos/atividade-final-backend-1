const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();
app.use(express.json());

const usersDB = [];

// Criar Usuário

app.post('/user', (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Digite todos os campos',
		});
	}

	const regex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	if (!String(email).match(regex)) {
		return res.status(400).json({
			success: false,
			message: 'Digite um email válido!',
		});
	}

	const userRepeat = usersDB.some((item) => item.email === email);

	if (userRepeat) {
		return res.status(400).json({
			success: false,
			message: 'Usuário já cadastrado!',
		});
	}

	const createUser = {
		name,
		email,
		password,
		id: uuid(),
		notes: [],
	};

	usersDB.push(createUser);
	return res.status(201).json({
		success: true,
		message: 'Usuário cadastrado com sucesso',
		data: createUser,
	});
});

// Login Usuário

app.post('/login', (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Digite todos os campos',
		});
	}
	const userLogged = usersDB.find(
		(item) => item.email === email && item.password === password
	);
	if (!userLogged) {
		return res.status(404).json({
			success: false,
			message: 'Email ou senha incorretos!',
		});
	}
	return res.status(200).json({
		success: true,
		message: 'Usuário Logado',
		data: userLogged,
	});
});

// Criar note

app.post('/note/:uid', (req, res) => {
	const { uid } = req.params;
	const { title, description } = req.body;
	const findUser = usersDB.find((item) => item.id === uid);

	if (!findUser) {
		return res.status(404).json({
			success: false,
			message: 'Usuário não encontrado!',
		});
	}

	if (!title || !description) {
		return res.status(400).json({
			success: false,
			message: 'Digite todos os campos',
		});
	}

	const note = {
		title,
		description,
		id: uuid(),
	};

	findUser.notes.push(note);
	return res.status(201).json({
		success: true,
		message: 'note criada!',
		data: findUser,
	});
});

// Listar notes do Usuário

app.get('/user/note/:uid', (req, res) => {
	const { uid } = req.params;
	const user = usersDB.find((item) => item.id === uid);

	if (!user.notes.length) {
		return res.status(404).json({
			success: false,
			message: 'Usuário não possui notes!',
		});
	}

	return res.status(200).json({
		success: true,
		message: 'Listando notes',
		data: user.notes,
	});
});

// Encontrar usuário por ID

app.get('/user/:uid', (req, res) => {
	const { uid } = req.params;

	const findUser = usersDB.find((item) => item.id === uid);

	if (!findUser) {
		return res.status(404).json({
			success: false,
			message: 'Usuário não encontrado!',
		});
	}

	return res.status(200).json({
		success: true,
		message: 'Usuário encontrado pelo ID',
		data: findUser,
	});
});

// Atualizar note de determinado usuário

app.put('/user/note/update/:uid/:noteuid', (req, res) => {
	const { uid, noteuid } = req.params;
	const { newTitle, newDescription } = req.body;

	if (!newTitle && !newDescription) {
		return res.status(400).json({
			success: false,
			message: 'Digite todos os campos',
		});
	}

	const findUser = usersDB.find((item) => item.id === uid);

	if (!findUser) {
		return res.status(404).json({
			success: false,
			message: 'Usuário não encontrado!',
		});
	}

	const findnote = findUser.notes.find((note) => note.id === noteuid);

	if (!findnote) {
		return res.status(404).json({
			success: false,
			message: 'Usuário não encontrado!',
		});
	}

	findnote.title = newTitle ? newTitle : findnote.title;
	findnote.description = newDescription ? newDescription : findnote.description;

	return res.status(200).json({
		success: true,
		message: 'note Atualizada',
		data: findUser.notes,
	});
});

// Delete note de determinado usuario

app.delete('/user/:uid/:noteuid', (req, res) => {
	const { uid, noteuid } = req.params;

	const findUser = usersDB.find((item) => item.id === uid);

	if (!findUser) {
		return res.status(404).json({
			success: false,
			message: 'Usuário não encontrado!',
		});
	}

	const findnoteIndex = findUser.notes.findIndex((note) => note.id === noteuid);

	if (findnoteIndex < 0) {
		return res.status(404).json({
			success: false,
			message: 'note não encontrada!',
		});
	}

	findUser.notes.splice(findnoteIndex, 1);

	return res.status(200).json({
		success: true,
		message: 'note deletada',
		data: findUser,
	});
});

app.listen(3333, () => console.log('Servidor rodando na porta 3333'));
