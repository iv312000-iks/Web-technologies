let username = "my name";
let bonusBalance = 1000;

console.log("Пользователь " + username);
console.log("Баланс " + bonusBalance);

let bonusBall = 50;
let minusBall = 3;
let purchases = 4;
let finalBalance = bonusBalance + purchases * bonusBall - 7 * minusBall;
console.log("Баланс через 7 дней: " + finalBalance);

let messages = [
  "Пойдем гулять в парк?",
  "Кажется, дождь собирается. Лучше пойдем в кино!",
  "Давай, сегодня как раз вышел новый фильм.",
  "Встречаемся через час у кинотеатра.",
];

console.log("\n Переписка ");
for (let i = 0; i < messages.length; i++) {
  let speaker = i % 2 === 0 ? "Друг" : "Вы";
  console.log(speaker + ": " + messages[i]);
}

let searchWord = "кино";
console.log('\n Поиск: "' + searchWord + '"');
for (let i = 0; i < messages.length; i++) {
  if (messages[i].includes(searchWord)) {
    let speaker = i % 2 === 0 ? "Друг" : "Вы";
    console.log(speaker + ": " + messages[i]);
  }
}
