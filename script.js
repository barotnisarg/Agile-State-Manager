const addTaskButton = document.querySelector("#addTaskButton");
const modalOverlay = document.querySelector("#modalOverlay"); 
const closeModalButton = document.querySelector("#closeModal"); 
const cardStates = document.querySelectorAll(".state");
const form = document.querySelector("form");
const taskTitle = document.querySelector("#taskTitle");
const taskDescription = document.querySelector("#taskDescription");
const backlogState = document.querySelector("#backlog");
const inProgressState = document.querySelector("#inProgress");
const inReviewState = document.querySelector("#inReview");
const doneState = document.querySelector("#done");
const blockedState = document.querySelector("#blocked");

let cardCounter = 0;

const maxInProgress = 3;
const maxInReview = 2;

const toggleModal = () => {
  modalOverlay.classList.toggle("hidden");
};

addTaskButton.addEventListener("click", toggleModal);

closeModalButton.addEventListener("click", toggleModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    toggleModal();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const div = document.createElement("div");
  const h2 = document.createElement("h2");
  const h3 = document.createElement("h3");

  h2.innerText = taskTitle.value;
  h3.innerText = taskDescription.value;

  div.appendChild(h2);
  div.appendChild(h3);

  div.classList.add("card");
  div.setAttribute("draggable", "true");
  div.id = `card-${cardCounter++}`;
  div.parentState = "backlog";
  div.blockedReason = null;
  div.desiredState = null;

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    div.remove();
    saveToLocalStorage();
  });

  div.appendChild(deleteBtn);

  div.addEventListener("click", () => {
    if (div.parentState === "blocked" && div.blockedReason) {
      alert("Blocked Reason: " + div.blockedReason);
    }
  });

  div.addEventListener("dragstart", (e) => {
    if (div.parentState === "blocked") {
      e.preventDefault();
      alert("Blocked task cannot be dragged");
      return;
    }
    e.dataTransfer.setData("taskCard", div.id);
  });

  backlogState.appendChild(div);
  saveToLocalStorage();

  toggleModal(); 
  form.reset();
});

cardStates.forEach((state) => {
  state.addEventListener("dragover", (e) => {
    e.preventDefault();
    state.classList.add("active");
  });

  state.addEventListener("dragleave", () => {
    state.classList.remove("active");
  });

  state.addEventListener("drop", (e) => {
    e.preventDefault();

    const cardId = e.dataTransfer.getData("taskCard");
    const droppedCard = document.getElementById(cardId);
    if (!droppedCard) return;

    if (
      droppedCard.parentState === "backlog" &&
      (state.id === "inProgress" || state.id === "backlog")
    ) {
      if (state.querySelectorAll(".card").length >= maxInProgress) {
        alert("Maximum tasks in Progress reached");

        droppedCard.blockedReason = "In Progress limit reached";
        droppedCard.desiredState = "inProgress";

        inBlockedState(droppedCard);
        state.classList.remove("active");
        saveToLocalStorage();
        return;
      }
      state.appendChild(droppedCard);
      droppedCard.parentState = state.id;

    } else if (
      droppedCard.parentState === "inProgress" &&
      (state.id === "inReview" || state.id === "inProgress")
    ) {
      if (state.querySelectorAll(".card").length >= maxInReview) {
        alert("Maximum tasks in Review reached");

        droppedCard.blockedReason = "In Review limit reached";
        droppedCard.desiredState = "inReview";

        inBlockedState(droppedCard);
        state.classList.remove("active");
        saveToLocalStorage();
        return;
      }
      state.appendChild(droppedCard);
      droppedCard.parentState = state.id;

    } else if (
      droppedCard.parentState === "inReview" &&
      (state.id === "done" || state.id === "inProgress")
    ) {
      state.appendChild(droppedCard);
      droppedCard.parentState = state.id;

    } else {
      alert("You are trying somwthing wrong!");
      inBlockedState(droppedCard);
      droppedCard.parentState = "blocked";
    }

    state.classList.remove("active");

    tryUnblockTasks();

    saveToLocalStorage();
  });
});

function inBlockedState(card) {
  blockedState.appendChild(card);
}

function tryUnblockTasks() {
  const blockedCards = blockedState.querySelectorAll(".card");

  blockedCards.forEach(card => {
    if (card.desiredState === "inProgress") {
      if (inProgressState.querySelectorAll(".card").length < maxInProgress) {
        inProgressState.appendChild(card);
        card.parentState = "inProgress";
        card.blockedReason = null;
        card.desiredState = null;
      }
    }

    if (card.desiredState === "inReview") {
      if (inReviewState.querySelectorAll(".card").length < maxInReview) {
        inReviewState.appendChild(card);
        card.parentState = "inReview";
        card.blockedReason = null;
        card.desiredState = null;
      }
    }
  });
}

function saveToLocalStorage() {
  const tasks = [];

  document.querySelectorAll(".card").forEach(card => {
    tasks.push({
      title: card.querySelector("h2").innerText,
      desc: card.querySelector("h3").innerText,
      state: card.parentState,
      blockedReason: card.blockedReason,
      desiredState: card.desiredState
    });
  });

  localStorage.setItem("taskBoard", JSON.stringify(tasks));
}

window.addEventListener("load", () => {
  const savedTasks = JSON.parse(localStorage.getItem("taskBoard"));
  if (!savedTasks) return;

  savedTasks.forEach(task => {
    taskTitle.value = task.title;
    taskDescription.value = task.desc;
    
    const div = document.createElement("div");
    const h2 = document.createElement("h2");
    const h3 = document.createElement("h3");

    h2.innerText = task.title;
    h3.innerText = task.desc;

    div.appendChild(h2);
    div.appendChild(h3);

    div.classList.add("card");
    div.setAttribute("draggable", "true");
    div.id = `card-${cardCounter++}`;
    div.parentState = task.state;
    div.blockedReason = task.blockedReason;
    div.desiredState = task.desiredState;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      div.remove();
      saveToLocalStorage();
    });

    div.appendChild(deleteBtn);
    
    div.addEventListener("click", () => {
        if (div.parentState === "blocked" && div.blockedReason) {
            alert("Blocked Reason: " + div.blockedReason);
        }
    });

    div.addEventListener("dragstart", (e) => {
        if (div.parentState === "blocked") {
            e.preventDefault();
            alert("Blocked task cannot be dragged");
            return;
        }
        e.dataTransfer.setData("taskCard", div.id);
    });

    document.querySelector(`#${task.state}`).appendChild(div);
  });

});
