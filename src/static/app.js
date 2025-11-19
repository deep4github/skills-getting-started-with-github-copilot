document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build card content with a participants section
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = details.description;
        activityCard.appendChild(desc);

        const sched = document.createElement("p");
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        activityCard.appendChild(sched);

        const avail = document.createElement("p");
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`;
        activityCard.appendChild(avail);

        // Participants section (updated: show count + avatar initials)
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("h5");
        const count = Array.isArray(details.participants) ? details.participants.length : 0;
        participantsTitle.textContent = count > 0 ? `Participants (${count})` : "Participants";
        participantsSection.appendChild(participantsTitle);

        // Helper: make initials from a name/email
        function getInitials(text) {
          if (!text) return "?";
          // use the part before @ for emails, otherwise split words
          const base = text.includes("@") ? text.split("@")[0] : text;
          const parts = base.split(/[\s._-]+/).filter(Boolean);
          if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
          return (parts[0][0] + parts[1][0]).substring(0, 2).toUpperCase();
        }

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const initial = document.createElement("span");
            initial.className = "participant-initial";
            initial.textContent = getInitials(p);
            initial.setAttribute("aria-hidden", "true");

            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = p;
            nameSpan.title = p;

            li.appendChild(initial);
            li.appendChild(nameSpan);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const none = document.createElement("p");
          none.className = "no-participants";
          none.textContent = "No participants yet.";
          participantsSection.appendChild(none);
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
