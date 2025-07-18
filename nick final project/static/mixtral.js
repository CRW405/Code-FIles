import { contentFilterText, stopAtLastPeriod, removeBlankLines } from "./content-filter.js";
import { hugging_face_key } from "./keys.js";
import { InferenceClient } from "@huggingface/inference"; // Import the InferenceClient from Hugging Face

// ensure you have the following script tag in your HTML to use the InferenceClient:
/*
    <script type="importmap">
            {
              "imports": {
                "@huggingface/inference": "https://cdn.skypack.dev/@huggingface/inference"
              }
            }
            </script>
*/

const submitButton = document.querySelector(".submit-btn");
const entry = document.querySelector(".image-gen-entry");
const textFrame = document.querySelector(".text-frame");
const downloadButton = document.querySelector(".download-btn");
const downloadableLink = document.querySelector(".download-link");

let records = [];

////////////////////////////////////////////////////////////////////
const client = new InferenceClient(hugging_face_key);
async function query(data) {
    try {
        const chatCompletion = await client.chatCompletion({
            provider: "together",
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
                {
                    role: "user",
                    content: data.inputs,
                },
            ],
        });
        console.log(chatCompletion);
        return [{ generated_text: chatCompletion.choices[0].message.content }];
    } catch (error) {
        console.error("Error querying the model:", error);
        throw error;
    }
}
////////////////////////////////////////////////////////////////////

downloadButton.addEventListener('click', () => {
    const filename = "records.txt";
    let conversation = "";
    if (records.length > 0) {
        records.forEach(record => {
            conversation += record + '\n' + '\n';
        });

        const blob = new Blob([conversation], {
            type: 'text/plain;charset=utf-8'
        });
        downloadableLink.download = filename;
        downloadableLink.href = window.URL.createObjectURL(blob);
    }
})


submitButton.addEventListener('click', () => {
    submit();
});

async function submit() {
    const input = entry.value;
    if (input != "") {
        let contentValue = await contentFilterText(input);
        if (contentValue == 1) {
            query({ "inputs": input, "parameters": { "return_full_text": false } }).then(async (response) => {
                let aiContentValue = await contentFilterText(response[0].generated_text);
                if (aiContentValue == 1) {
                    //////////////////////////////////////////////
                    let AIresult = response[0].generated_text
                    const userInput = document.createElement("p");
                    const aiOutput = document.createElement("p");
                    userInput.classList.add("user-bubble");
                    aiOutput.classList.add("ai-bubble");
                    let cutoff = stopAtLastPeriod(AIresult);

                    userInput.innerHTML = input;
                    aiOutput.innerHTML = cutoff;
                    textFrame.appendChild(userInput);
                    textFrame.appendChild(aiOutput);

                    let noBlankLines = removeBlankLines(cutoff);
                    records.push("User: " + userInput.innerHTML)
                    records.push("AI: " + noBlankLines)
                    //////////////////////////////////////////////
                } else {
                    setPlaceholder(aiContentValue);
                }
            });
        } else {
            setPlaceholder(contentValue);
        }

    }

}


function setPlaceholder(cv) {
    if (cv == 0) {
        entry.value = "";
        entry.placeholder = "Please be appropriate!";
    } else {
        entry.value = "";
        entry.placeholder = "There has been an error.";
    }
}


