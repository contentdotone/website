"use strict";
var theme = {
   init: function () {
      theme.menu();
      theme.otpVarification();
      // theme.stickyHeader();
      theme.counterState();
      theme.alertJS();
      theme.popovers();
      theme.tooltip();
      theme.validation();
      theme.toast();
   },

   // Menu
   menu: () => {
      const dropdownLinks = document.querySelectorAll(".dropdown-menu a.dropdown-toggle");

      dropdownLinks.forEach(function (dropdownLink) {
         dropdownLink.addEventListener("click", function (e) {
            if (!this.nextElementSibling.classList.contains("show")) {
               const parentDropdownMenu = this.closest(".dropdown-menu");
               const currentlyOpenSubMenus = parentDropdownMenu.querySelectorAll(".show");
               currentlyOpenSubMenus.forEach(function (openSubMenu) {
                  openSubMenu.classList.remove("show");
               });
            }

            const subMenu = this.nextElementSibling;
            subMenu.classList.toggle("show");

            const parentDropdown = this.closest("li.nav-item.dropdown.show");
            if (parentDropdown) {
               parentDropdown.addEventListener("hidden.bs.dropdown", function (e) {
                  const dropdownSubMenus = document.querySelectorAll(".dropdown-submenu .show");
                  dropdownSubMenus.forEach(function (dropdownSubMenu) {
                     dropdownSubMenu.classList.remove("show");
                  });
               });
            }

            e.stopPropagation();
         });
      });
   },

   // Sticky Header
   // stickyHeader: () => {
   //    var navbar = document.querySelector(".navbar");
   //    if (navbar == null) return;
   //    var options = {
   //       offset: 400,
   //       offsetSide: "top",
   //       classes: {
   //          clone: "navbar-clone fixed",
   //          stick: "navbar-stick",
   //          unstick: "navbar-unstick",
   //       },
   //       onStick: function () {
   //          var navbarClonedClass = this.clonedElem.classList;
   //          if (navbarClonedClass.contains("transparent") && navbarClonedClass.contains("navbar-dark")) {
   //             this.clonedElem.className = this.clonedElem.className.replace("navbar-dark", "navbar-light", "navbar-stick");
   //          }
   //       },
   //    };
   //    var banner = new Headhesive(".navbar", options);
   // },

   // Counter State
   counterState: () => {
      var counters = document.querySelectorAll(".counter");
      counters.forEach(function (counter) {
         var countTo = counter.getAttribute("data-count");
         var countNum = parseInt(counter.textContent);
         var duration = 4000;
         var stepDuration = duration / Math.abs(countTo - countNum);
         var increment = countTo > countNum ? 1 : -1;

         var timer = setInterval(function () {
            countNum += increment;
            counter.textContent = countNum;

            if (countNum == countTo) {
               clearInterval(timer);
               //alert('finished');
            }
         }, stepDuration);
      });
   },

   // Alert
   alertJS: () => {
      const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
      const appendAlert = (message, type) => {
         const wrapper = document.createElement("div");
         wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            "</div>",
         ].join("");

         alertPlaceholder.append(wrapper);
      };

      const alertTrigger = document.getElementById("liveAlertBtn");
      if (alertTrigger) {
         alertTrigger.addEventListener("click", () => {
            appendAlert("Nice, you triggered this alert message!", "success");
         });
      }
   },

   // Popovers
   popovers: () => {
      const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
      const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));
   },

   // Tooltip
   tooltip: () => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
   },

   // Validation
   validation: () => {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      const forms = document.querySelectorAll(".needs-validation");
      // Loop over them and prevent submission
      Array.from(forms).forEach((form) => {
         form.addEventListener(
            "submit",
            (event) => {
               if (!form.checkValidity()) {
                  event.preventDefault();
                  event.stopPropagation();
               }

               form.classList.add("was-validated");
            },
            false,
         );
      });
   },

   // Toast
   toast: () => {
      const toastTrigger = document.getElementById("liveToastBtn");
      const toastLiveExample = document.getElementById("liveToast");

      if (toastTrigger) {
         const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
         toastTrigger.addEventListener("click", () => {
            toastBootstrap.show();
         });
      }
   },

   // Otp code
   otpVarification: () => {
      document.moveToNextInput = function (input) {
         if (input.value.length === input.maxLength) {
            // Get the index of the current input field
            const currentIndex = Array.from(input.parentElement.children).indexOf(input);

            // Get the next input field if it exists
            const nextInput = input.parentElement.children[currentIndex + 1];

            // Move focus to the next input field
            if (nextInput) {
               nextInput.focus();
            }
         }
      };
   },
};

theme.init();
