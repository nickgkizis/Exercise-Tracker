document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("exercise-form");
  const exerciseList = document.getElementById("exercise-list");
  const modal = document.getElementById("editModal");
  const newWeightInput = document.getElementById("new-weight");
  const progressChartCanvas = document.getElementById("progressChart");
  let progressChart;
  let selectedExerciseIndex = null;

  let selectedMuscleGroup = "";
  let exercises = JSON.parse(localStorage.getItem("exercises")) || [];

  // Handle muscle group selection
  document.querySelectorAll(".muscle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".muscle-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedMuscleGroup = btn.getAttribute("data-group");
      document.getElementById("exercise-muscle-group").value =
        selectedMuscleGroup;
    });
  });

  function renderExercises() {
    exerciseList.innerHTML = "";
    exercises.forEach((exercise, index) => {
      const li = document.createElement("li");
      li.className = exercise.muscleGroup;
      li.innerHTML = `
                <div>
                    <span>${exercise.name} - ${exercise.sets}x${exercise.reps} - ${exercise.weight}kg</span>
                </div>
                <button onclick="deleteExercise(${index})">Delete</button>
            `;
      li.addEventListener("click", () => openModal(index)); // Correctly pass the index here
      exerciseList.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedMuscleGroup) {
      alert("Please select a muscle group!");
      return;
    }

    const exercise = {
      name: document.getElementById("exercise-name").value,
      sets: document.getElementById("exercise-sets").value,
      reps: document.getElementById("exercise-reps").value,
      weight: document.getElementById("exercise-weight").value,
      muscleGroup: selectedMuscleGroup,
      history: [
        {
          date: new Date().toISOString(),
          weight: document.getElementById("exercise-weight").value,
        },
      ],
    };

    exercises.push(exercise);
    localStorage.setItem("exercises", JSON.stringify(exercises));
    renderExercises();
    form.reset();
    selectedMuscleGroup = "";
    document
      .querySelectorAll(".muscle-btn")
      .forEach((b) => b.classList.remove("selected"));
  });

  window.deleteExercise = (index) => {
    exercises.splice(index, 1);
    localStorage.setItem("exercises", JSON.stringify(exercises));
    renderExercises();
  };

  function openModal(index) {
    selectedExerciseIndex = index; // Ensure the index is properly set
    const exercise = exercises[selectedExerciseIndex];
    if (!exercise) return; // Check if the exercise exists
    newWeightInput.value = exercise.weight;
    modal.style.display = "flex";
    renderProgressChart(exercise.history);
  }

  window.closeModal = () => {
    modal.style.display = "none";
  };

  window.saveNewWeight = () => {
    if (selectedExerciseIndex === null) return;
    const newWeight = parseFloat(newWeightInput.value);
    if (isNaN(newWeight) || newWeight <= 0) {
      alert("Please enter a valid weight.");
      return;
    }

    // Update the weight
    exercises[selectedExerciseIndex].weight = newWeight;
    exercises[selectedExerciseIndex].history.push({
      date: new Date().toISOString(),
      weight: newWeight,
    });
    localStorage.setItem("exercises", JSON.stringify(exercises));

    // Update the main exercise list and the progress chart
    renderExercises();
    renderProgressChart(exercises[selectedExerciseIndex].history);

    // Modal will not close here, it stays open
  };

  function renderProgressChart(history) {
    const labels = history.map((entry) =>
      new Date(entry.date).toLocaleDateString()
    );
    const weights = history.map((entry) => entry.weight);

    if (progressChart) {
      progressChart.destroy();
    }

    progressChart = new Chart(progressChartCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Weight Progress",
            data: weights,
            borderColor: "blue",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  renderExercises();
});
