// Main Dish
document.addEventListener("DOMContentLoaded", function () {
  var select = document.getElementById("main_dishes");
  var otherBox = document.getElementById("other-dish-box");
  var otherInput = document.getElementById("other_dish");

  select.addEventListener("change", function () {
    if (this.value === "other") {
      otherBox.style.display = "block";
      otherInput.focus();
    } else {
      otherBox.style.display = "none";
    }
  });

  otherInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && this.value.trim() !== "") {
      e.preventDefault();
      // Create new option
      var newOption = document.createElement("option");
      newOption.value = this.value.trim();
      newOption.text = this.value.trim();
      // Add and select it
      select.appendChild(newOption);
      select.value = newOption.value;
      // Hide input and clear
      otherBox.style.display = "none";
      this.value = "";
    }
  });
});

// Other Main Dish
document.addEventListener("DOMContentLoaded", function () {
  // Main Dishes "Other"
  var mainSelect = document.getElementById("main_dishes");
  var otherDishBox = document.getElementById("other-dish-box");
  var otherDishInput = document.getElementById("other_dish");
  if (mainSelect && otherDishBox && otherDishInput) {
    mainSelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherDishBox.style.display = "block";
        otherDishInput.focus();
      } else {
        otherDishBox.style.display = "none";
      }
    });
    otherDishInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && this.value.trim() !== "") {
        e.preventDefault();
        var newOption = document.createElement("option");
        newOption.value = this.value.trim();
        newOption.text = this.value.trim();
        mainSelect.appendChild(newOption);
        mainSelect.value = newOption.value;
        otherDishBox.style.display = "none";
        this.value = "";
      }
    });
  }

  // Protein "Other"
  var proteinSelect = document.getElementById("protein");
  var otherProteinBox = document.getElementById("other-protein-box");
  var otherProteinInput = document.getElementById("other_protein");
  if (proteinSelect && otherProteinBox && otherProteinInput) {
    proteinSelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherProteinBox.style.display = "block";
        otherProteinInput.focus();
      } else {
        otherProteinBox.style.display = "none";
      }
    });
    otherProteinInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && this.value.trim() !== "") {
        e.preventDefault();
        var entered = this.value.trim();
        var newOption = document.createElement("option");
        newOption.value = entered + " - ¢10.00";
        newOption.text = entered + " - ¢10.00";
        proteinSelect.appendChild(newOption);
        proteinSelect.value = newOption.value;
        otherProteinBox.style.display = "none";
        this.value = "";
      }
    });
  }
});

// Protein
document.addEventListener("DOMContentLoaded", function () {
  // Protein 2 "Other"
  var protein2Select = document.getElementById("req_Protein2");
  var otherProtein2Box = document.getElementById("other-protein2-box");
  var otherProtein2Input = document.getElementById("other_protein2");
  if (protein2Select && otherProtein2Box && otherProtein2Input) {
    protein2Select.addEventListener("change", function () {
      if (this.value === "other") {
        otherProtein2Box.style.display = "block";
        otherProtein2Input.focus();
      } else {
        otherProtein2Box.style.display = "none";
      }
    });
    otherProtein2Input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && this.value.trim() !== "") {
        e.preventDefault();
        var entered = this.value.trim();
        var newOption = document.createElement("option");
        newOption.value = entered + " - ¢10.00";
        newOption.text = entered + " - ¢10.00";
        protein2Select.appendChild(newOption);
        protein2Select.value = newOption.value;
        otherProtein2Box.style.display = "none";
        this.value = "";
      }
    });
  }
});

// Accompainment
document.addEventListener("DOMContentLoaded", function () {
  var accSelect = document.getElementById("req_Accompaniment");
  var otherAccBox = document.getElementById("other-accompaniment-box");
  var otherAccInput = document.getElementById("other_accompaniment");
  if (accSelect && otherAccBox && otherAccInput) {
    accSelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherAccBox.style.display = "block";
        otherAccInput.focus();
      } else {
        otherAccBox.style.display = "none";
      }
    });
    otherAccInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && this.value.trim() !== "") {
        e.preventDefault();
        var entered = this.value.trim();
        var newOption = document.createElement("option");
        newOption.value = entered;
        newOption.text = entered;
        accSelect.appendChild(newOption);
        accSelect.value = newOption.value;
        otherAccBox.style.display = "none";
        this.value = "";
      }
    });
  }
});

// Other Pakaging
document.addEventListener("DOMContentLoaded", function () {
  var packagingSelect = document.getElementById("req_Packaging");
  var otherPackagingBox = document.getElementById("other-packaging-box");
  var otherPackagingInput = document.getElementById("other_packaging");
  if (packagingSelect && otherPackagingBox && otherPackagingInput) {
    packagingSelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherPackagingBox.style.display = "block";
        otherPackagingInput.focus();
      } else {
        otherPackagingBox.style.display = "none";
      }
    });
    otherPackagingInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && this.value.trim() !== "") {
        e.preventDefault();
        var entered = this.value.trim();
        var newOption = document.createElement("option");
        newOption.value = entered + " - ¢10.00";
        newOption.text = entered + " - ¢10.00";
        packagingSelect.appendChild(newOption);
        packagingSelect.value = newOption.value;
        otherPackagingBox.style.display = "none";
        this.value = "";
      }
    });
  }
});

// Delivery
document.addEventListener("DOMContentLoaded", function () {
  var deliverySelect = document.getElementById("req_Delivery");
  var otherDeliveryBox = document.getElementById("other-delivery-box");
  var otherDeliveryInput = document.getElementById("other_delivery");
  if (deliverySelect && otherDeliveryBox && otherDeliveryInput) {
    deliverySelect.addEventListener("change", function () {
      if (this.value === "other") {
        otherDeliveryBox.style.display = "block";
        otherDeliveryInput.focus();
      } else {
        otherDeliveryBox.style.display = "none";
      }
    });
    otherDeliveryInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && this.value.trim() !== "") {
        e.preventDefault();
        var entered = this.value.trim();
        var newOption = document.createElement("option");
        newOption.value = entered + " - ¢10.00";
        newOption.text = entered + " - ¢10.00";
        deliverySelect.appendChild(newOption);
        deliverySelect.value = newOption.value;
        otherDeliveryBox.style.display = "none";
        this.value = "";
      }
    });
  }
});
