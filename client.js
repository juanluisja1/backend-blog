// public/main.js
document.addEventListener('DOMContentLoaded', () => {
  const commentsContainer = document.getElementById('comments');
  const commentForm = document.getElementById('comment-form');
  const nameInput = document.getElementById('name');
  const commentInput = document.getElementById('comment');

  // Function to fetch and display comments
  function fetchComments() {
    fetch('api/get-comments/')
      .then((response) => response.json())
      .then((data) => {
        commentsContainer.innerHTML = '';
        data.forEach((comment) => {
          const commentDiv = document.createElement('div');
          commentDiv.innerHTML = `
            <strong>${comment.name}:</strong> ${comment.comment}
          `;
          commentsContainer.appendChild(commentDiv);
        });
      });
  }

  // Event listener for form submission
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value;
    const comment = commentInput.value;

    if (name && comment) {
      fetch('/add-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, comment }),
      })
        .then((response) => {
          if (response.ok) {
            nameInput.value = '';
            commentInput.value = '';
            fetchComments(); // Refresh the comments after posting
          }
        });
    }
  });

  // Fetch and display comments on page load
  fetchComments();
});

// Event listener for form submission
commentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = nameInput.value;
  const comment = commentInput.value;

  if (!name || !comment) {
    alert('Please enter your name and comment.');
    return;
  }

  fetch('/add-comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, comment }),
  })
    .then((response) => {
      if (response.ok) {
        nameInput.value = '';
        commentInput.value = '';
        fetchComments(); // Refresh the comments after posting
      }
    });
});
