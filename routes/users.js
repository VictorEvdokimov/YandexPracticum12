const router = require('express').Router();
const fs = require('fs');

const jsonUsers = fs.readFileSync('./data/users.json');
const users = JSON.parse(jsonUsers);

router.get('/', (req, res) => {
  res.send(users);
});

router.get('/:id', (req, res) => {
  const user = users.find((item) => item._id === req.params.id);

  if (!user) {
    res.status(404).send({ message: 'Нет пользователя с таким id' });
  } else {
    res.send(user);
  }
});

module.exports = router;
