import db from "../../data_base/db-system.mjs";

const getButton = document.getElementById("getButton");

function getDB() {
  db.get();
}

getButton.addEventListener("click", getDB);
