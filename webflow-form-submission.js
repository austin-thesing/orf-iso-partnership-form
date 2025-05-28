// Webflow to HubSpot Form Submission Handler
(function () {
  // HubSpot configuration
  const HUBSPOT_CONFIG = {
    portalId: "19654160",
    formId: "baf01d73-226a-4012-91f0-2f21b0b4fc05",
  };

  // Function to get UTM parameters from URL
  function getUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get("utm_source") || "",
      utm_campaign: urlParams.get("utm_campaign") || "",
      utm_medium: urlParams.get("utm_medium") || "",
      utm_term: urlParams.get("utm_term") || "",
      utm_content: urlParams.get("utm_content") || "",
    };
  }

  // Function to populate UTM hidden fields
  function populateUTMFields() {
    const utmParams = getUTMParameters();

    Object.keys(utmParams).forEach((key) => {
      const field = document.getElementById(key);
      if (field) {
        field.value = utmParams[key];
      }
    });
  }

  // Function to submit data to HubSpot
  async function submitToHubSpot(formData) {
    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_CONFIG.portalId}/${HUBSPOT_CONFIG.formId}`;

    // Prepare the data for HubSpot
    const hubspotData = {
      fields: [
        { name: "firstname", value: formData.get("firstname") },
        { name: "lastname", value: formData.get("lastname") },
        { name: "email", value: formData.get("email") },
        { name: "phone", value: formData.get("phone") },
        { name: "company", value: formData.get("company") },
        { name: "utm_source", value: formData.get("utm_source") },
        { name: "utm_campaign", value: formData.get("utm_campaign") },
        { name: "utm_medium", value: formData.get("utm_medium") },
        { name: "utm_term", value: formData.get("utm_term") },
        { name: "utm_content", value: formData.get("utm_content") },
      ].filter((field) => field.value), // Only include fields with values
      context: {
        pageUri: window.location.href,
        pageName: document.title,
        hutk: getCookie("hubspotutk"), // HubSpot tracking cookie if available
      },
    };

    try {
      const response = await fetch(hubspotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotData),
      });

      if (!response.ok) {
        throw new Error(`HubSpot submission failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting to HubSpot:", error);
      throw error;
    }
  }

  // Helper function to get cookie value
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Function to show success message
  function showSuccessMessage() {
    const form = document.getElementById("wf-form-iso-form");
    const successDiv = document.createElement("div");
    successDiv.innerHTML = `
      <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin-top: 10px;">
        <strong>Success!</strong> Thank you for your submission. We'll be in touch soon.
      </div>
    `;
    form.parentNode.insertBefore(successDiv, form.nextSibling);
    form.style.display = "none";
  }

  // Function to show error message
  function showErrorMessage() {
    const form = document.getElementById("wf-form-iso-form");
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-top: 10px;">
        <strong>Error!</strong> There was a problem submitting your form. Please try again.
      </div>
    `;
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
  }

  // Main form submission handler
  function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const submitButton = form.querySelector("#submit-btn");
    const originalButtonText = submitButton.value;

    // Show loading state
    submitButton.value = "Submitting...";
    submitButton.disabled = true;

    // Get form data
    const formData = new FormData(form);

    // Submit to HubSpot
    submitToHubSpot(formData)
      .then((response) => {
        console.log("HubSpot submission successful:", response);
        showSuccessMessage();
      })
      .catch((error) => {
        console.error("HubSpot submission failed:", error);
        showErrorMessage();
        // Reset button state on error
        submitButton.value = originalButtonText;
        submitButton.disabled = false;
      });
  }

  // Initialize when DOM is ready
  function initialize() {
    // Populate UTM fields from URL parameters
    populateUTMFields();

    // Attach form submission handler
    const form = document.getElementById("wf-form-iso-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmission);
      console.log("HubSpot form handler initialized");
    } else {
      console.error('Form with ID "wf-form-iso-form" not found');
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
