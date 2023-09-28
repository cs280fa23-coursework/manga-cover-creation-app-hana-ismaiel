import "../style.css";

// Constants
const ENDPOINT_COMPLETIONS = "https://api.openai.com/v1/chat/completions";
const ENDPOINT_IMAGES = "https://api.openai.com/v1/images/generations";

// Global variables
let API_KEY;

// Helper functions
async function getBlurb(title, theme) {
  // Use the OpenAI API to generate a blurb based on the title and theme.
  // You should use the global API_KEY variable to authenticate your request.
  // You must use fetch to make the request.
  // You should return the generated blurb.

  try {
    const response = await fetch(ENDPOINT_COMPLETIONS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "assistant",
            content: `Generate a short manga blurb no more than 1000 characters given this title (${title}) and theme (${theme})`
          },
        ],
        model: "gpt-3.5-turbo"
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.log(err);
  }

}

async function getCoverImage(blurb) {
  // Use the OpenAI API to generate a cover image based on the blurb.
  // You should use the global API_KEY variable to authenticate your request.
  // You must use fetch to make the request.
  // You should return the URL of the generated image.

  const MAX_PROMPT_LENGTH = 1000;
  const fullPrompt = `Generate a manga cover image given this blurb (${blurb})`;
  const shortenedPrompt = fullPrompt.slice(0, MAX_PROMPT_LENGTH); // make sure prompt is under 1000 characters
  try {
    const response = await fetch(ENDPOINT_IMAGES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: shortenedPrompt
      })
    });

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating cover image:", error);
    throw error;
  }
}

// Event handlers
async function handleFormSubmission(e) {
  // This function is called when the form is submitted.
  // It should get the title and theme from the form.
  // It should then call getBlurb and getCoverImage to generate the blurb and image.
  // Finally, it should update the DOM to display the blurb and image.
  e.preventDefault();

  const titleInput = document.getElementById("mangaTitle");
  const themeInput = document.getElementById("mangaTheme");
  const title = titleInput.value;
  if (title.trim() === "") { // check if title is missing
    alert(
      "Please enter a title.",
    );
    return;
  }
  const theme = themeInput.value;
  if (theme.trim() === "") { // check if theme is missing
    alert(
      "Please enter a theme.",
    );
    return;
  }
  titleInput.disabled = true;
  themeInput.disabled = true;

  const blurbElement = document.getElementById("generatedBlurb");
  blurbElement.innerText = "";
  if (!blurbElement.classList.contains("hidden")) { // clear previous results
    blurbElement.classList.add("hidden");
  }

  const imageElement = document.getElementById("coverImage");
  imageElement.url = "";
  if (!imageElement.classList.contains("hidden")) { // clear previous results
    imageElement.classList.add("hidden");
  }

  const generateButton = document.getElementById("generateButton");
  generateButton.classList.add("hidden");

  const spinner = document.getElementById("spinner");
  spinner.classList.remove("hidden");

  try {
    const blurb = await getBlurb(title, theme);
    blurbElement.innerText = blurb;
    blurbElement.classList.remove("hidden");

    const imageUrl = await getCoverImage(blurb);
    imageElement.src = imageUrl;
    imageElement.classList.remove("hidden");

    spinner.classList.add("hidden");
    generateButton.classList.remove("hidden");

    titleInput.disabled = false;
    themeInput.disabled = false;

  } catch (error) {
    console.error("Error handling form submission:", error);
  }

}

document.addEventListener("DOMContentLoaded", () => {
  API_KEY = localStorage.getItem("openai_api_key");

  if (!API_KEY) {
    alert(
      "Please store your API key in local storage with the key 'openai_api_key'.",
    );
    return;
  }

  const mangaInputForm = document.getElementById("mangaInputForm");
  mangaInputForm.addEventListener("submit", handleFormSubmission);
});
