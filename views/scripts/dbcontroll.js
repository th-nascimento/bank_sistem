const getButton = document.getElementById("getButton");
const delButton = document.getElementById("delButton");
const idPrompt = document.getElementById("idPrompt");
const uNamePrompt = document.getElementById("uNamePrompt");
const namePrompt = document.getElementById("namePrompt");

function getDB() {
  fetch("http://localhost:3000/users/get-all")
    .then((res) => {
      return res.json();
    })
    .then((db) => {
      db.forEach((element) => {
        console.log(element);
      });
    });
}

getButton.addEventListener("click", getDB);

function delUserDb() {
  //console.log(id.value, userName.value, name.value)
  console.log(idPrompt.value, uNamePrompt.value, namePrompt.value);
}

delButton.addEventListener("click", delUserDb);
