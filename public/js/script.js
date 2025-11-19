document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".needs-validation");

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.checkValidity()) {
          field.classList.add("is-valid");
          field.classList.remove("is-invalid");
        } else {
          field.classList.add("is-invalid");
          field.classList.remove("is-valid");
        }
      });
    });

    form.addEventListener("submit", (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  });
});
