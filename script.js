document.addEventListener("DOMContentLoaded", () => {
    const subjects = document.querySelectorAll(".subject");

    subjects.forEach(subject => {
        if (subject.classList.contains("unlocked")) {
            subject.addEventListener("click", approveSubject);
        }
    });

    function approveSubject(event) {
        const subject = event.target;
        if (!subject.classList.contains("unlocked") || subject.classList.contains("approved")) return;

        subject.classList.add("approved");

        const subjectId = subject.dataset.id;

        subjects.forEach(nextSubject => {
            const req = nextSubject.dataset.req;
            if (req && req.split(",").includes(subjectId)) {
                nextSubject.classList.add("unlocked");
                nextSubject.style.cursor = "pointer";
                nextSubject.addEventListener("click", approveSubject);
            }
        });
    }
});

