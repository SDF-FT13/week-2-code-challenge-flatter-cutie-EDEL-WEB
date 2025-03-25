 document.addEventListener("DOMContentLoaded", () => {
    const characterBar = document.querySelector("#character-bar");
    const detailedInfo = document.querySelector("#detailed-info");
    const votesForm = document.querySelector("#votes-form");
    const votesInput = document.querySelector("#votes");
    const votesDisplay = document.querySelector("#vote-count");
    const resetButton = document.querySelector("#reset-button");
    const characterForm = document.querySelector("#character-form");

    let currentCharacter = null;

    
    fetch("http://localhost:3000/characters")
        .then(response => response.json())
        .then(characters => {
            characters.forEach(character => addCharacterToBar(character));
            if (characters.length > 0) displayCharacter(characters[0]); 
        })
        .catch(error => console.error("Error fetching characters:", error));

    
    function displayCharacter(character) {
        if (!character) return;

        currentCharacter = character;
        console.log("Displaying character:", currentCharacter);

        const nameElement = detailedInfo.querySelector("h2");
        const imageElement = detailedInfo.querySelector("img");

        if (nameElement) nameElement.textContent = character.name;
        if (imageElement) imageElement.src = character.image;

        votesDisplay.textContent = character.votes;
    }

    
    function addCharacterToBar(character) {
        const characterSpan = document.createElement("span");
        characterSpan.textContent = character.name;
        characterSpan.style.cursor = "pointer";
        characterSpan.addEventListener("click", () => displayCharacter(character));
        characterBar.appendChild(characterSpan);
    }

    
    if (votesForm) {
        votesForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!currentCharacter || !currentCharacter.id) return;

            const addedVotes = parseInt(votesInput.value, 10);
            if (isNaN(addedVotes) || votesInput.value.trim() === "") return;

            let updatedVotes = parseInt(votesDisplay.textContent, 10) + addedVotes;
            votesDisplay.textContent = updatedVotes;

            fetch(`http://localhost:3000/characters/${currentCharacter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ votes: updatedVotes }),
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(`Error ${response.status}: ${text}`); });
                }
                return response.json();
            })
            .then(updatedCharacter => console.log("Updated character:", updatedCharacter))
            .catch(error => console.error("Error updating votes:", error));
            
            votesInput.value = "";
        });
    }            

    
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            if (!currentCharacter || !currentCharacter.id) return;

            votesDisplay.textContent = "0";

            fetch(`http://localhost:3000/characters/${currentCharacter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: currentCharacter.name,
                    image: currentCharacter.image,
                    votes: 0 
                }),
            })
            .then(response => response.json())
            .then(updatedCharacter => console.log("Votes reset:", updatedCharacter))
            .catch(error => console.error("Error resetting votes:", error));
        });
    }

    
    if (characterForm) {
        characterForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.querySelector("#name").value.trim();
            const image = document.querySelector("#image").value.trim();

            if (!name || !image) return;

            const newCharacter = { name, image, votes: 0 };

            fetch("http://localhost:3000/characters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCharacter),
            })
            .then(response => response.json())
            .then(savedCharacter => {
                addCharacterToBar(savedCharacter);
                displayCharacter(savedCharacter);
            })
            .catch(error => console.error("Error adding character:", error));

            event.target.reset();
        });
    }
 });

