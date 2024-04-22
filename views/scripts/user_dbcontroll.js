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
      console.log(db);
      /* db.forEach((element) => {
        console.log(element);
      }); */
    });
}

getButton.addEventListener("click", getDB);

async function delUserDb() {
  let userId = idPrompt.value;
  let userName = uNamePrompt.value;
  let fullName = namePrompt.value;

  let fetchUrl = `http://localhost:3000/users/deleteUser?userId=${userId}&userName=${userName}&fullName=${fullName}`;

  try {
    const response = await fetch(fetchUrl);

    if (response.ok) {
      console.log(response);
    } else {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

delButton.addEventListener("click", delUserDb);
