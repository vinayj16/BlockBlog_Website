document.addEventListener("DOMContentLoaded", () => {
    const cardComments = new CardComments();
});

class CardComments {
    constructor() {
        this.commentsData = this.loadComments();
        this.loggedInUser = localStorage.getItem("username") || "Guest";
        this.cards = document.querySelectorAll(".card");
        this.currentCard = 0;

        this.initializeCards();
        this.bindEvents();
    }

    initializeCards() {
        this.updateCardDisplay();
        this.loadAllComments();
    }

    bindEvents() {
        document.querySelectorAll(".comment-form").forEach((form) => {
            form.addEventListener("submit", (e) => this.handleCommentSubmit(e));
        });

        document.querySelector(".prev")?.addEventListener("click", () => this.navigate("prev"));
        document.querySelector(".next")?.addEventListener("click", () => this.navigate("next"));

        document.querySelectorAll(".dot").forEach((dot, index) => {
            dot.addEventListener("click", () => this.goToCard(index));
        });

        document.addEventListener("click", (event) => {
            if (event.target.classList.contains("submit-reply-btn")) {
                this.handleReply(event.target);
            }
        });
    }

    handleCommentSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const cardTitle = form.closest(".card").querySelector(".image-title").textContent;
        const commentText = form.querySelector("textarea").value.trim();

        if (commentText) {
            this.addComment(cardTitle, commentText);
            form.querySelector("textarea").value = "";
        } else {
            alert("Please enter a comment.");
        }
    }

    addComment(cardTitle, text) {
        const comment = {
            id: Date.now(),
            text: text,
            time: new Date().toLocaleString(),
            likes: 0,
            liked: false,
            author: this.loggedInUser,
            replies: [],
        };

        if (!this.commentsData[cardTitle]) {
            this.commentsData[cardTitle] = [];
        }

        this.commentsData[cardTitle].unshift(comment);
        this.saveComments();
        this.updateComments(cardTitle);
    }

    updateComments(cardTitle) {
        const card = [...this.cards].find(card =>
            card.querySelector(".image-title").textContent === cardTitle
        );

        if (!card) return;

        const commentsTable = card.querySelector(".comments-table tbody");
        const comments = this.commentsData[cardTitle] || [];

        commentsTable.innerHTML = comments.map(comment => this.createCommentHTML(comment)).join("");
        this.attachCommentActions(card, cardTitle);
    }

    createCommentHTML(comment) {
        return `
            <tr data-comment-id="${comment.id}">
                <td><strong>${comment.author}</strong>: ${comment.text}</td>
                <td>${comment.time}</td>
                <td class="comment-actions">
                    <button class="like-btn ${comment.liked ? "liked" : ""}" data-comment-id="${comment.id}">👍 (${comment.likes})</button>
                    <button class="reply-btn" data-comment-id="${comment.id}">💬 Reply</button>
                    ${comment.author === this.loggedInUser ? `<button class="delete-btn" data-comment-id="${comment.id}">🗑️ Delete</button>` : ""}
                </td>
            </tr>
            ${comment.replies.length ? comment.replies.map(reply => `
                <tr class="reply-content">
                    <td colspan="3"><strong>${reply.author}</strong>: ${reply.text} <span class="reply-time">${reply.time}</span></td>
                </tr>`).join("") : ""}
            ${comment.showReplyForm ? `
                <tr class="reply-form-row">
                    <td colspan="3">
                        <textarea placeholder="Write your reply..."></textarea>
                        <button class="submit-reply-btn" data-comment-id="${comment.id}">Submit Reply</button>
                    </td>
                </tr>` : ""}
        `;
    }

    attachCommentActions(card, cardTitle) {
        card.querySelectorAll(".like-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const commentId = parseInt(btn.dataset.commentId);
                const comment = this.commentsData[cardTitle].find(c => c.id === commentId);
                if (comment) {
                    comment.liked = !comment.liked;
                    comment.likes += comment.liked ? 1 : -1;
                    this.saveComments();
                    this.updateComments(cardTitle);
                }
            });
        });

        card.querySelectorAll(".reply-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const commentId = parseInt(btn.dataset.commentId);
                const comment = this.commentsData[cardTitle].find(c => c.id === commentId);
                if (comment) {
                    comment.showReplyForm = !comment.showReplyForm;
                    this.updateComments(cardTitle);
                }
            });
        });

        card.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const commentId = parseInt(btn.dataset.commentId);
                const comment = this.commentsData[cardTitle].find(c => c.id === commentId);
                if (comment && comment.author === this.loggedInUser) {
                    this.commentsData[cardTitle] = this.commentsData[cardTitle].filter(c => c.id !== commentId);
                    this.saveComments();
                    this.updateComments(cardTitle);
                } else {
                    alert("You can only delete your own comments.");
                }
            });
        });
    }

    handleReply(button) {
        const commentId = parseInt(button.dataset.commentId);
        const replyBox = button.previousElementSibling;
        const replyText = replyBox.value.trim();

        if (!replyText) {
            alert("Reply cannot be empty!");
            return;
        }

        Object.keys(this.commentsData).forEach(cardTitle => {
            const comment = this.commentsData[cardTitle].find(c => c.id === commentId);
            if (comment) {
                comment.replies.push({
                    author: this.loggedInUser,
                    text: replyText,
                    time: new Date().toLocaleString()
                });
                replyBox.value = "";
                this.saveComments();
                this.updateComments(cardTitle);
            }
        });
    }

    loadAllComments() {
        Object.keys(this.commentsData).forEach(cardTitle => {
            this.updateComments(cardTitle);
        });
    }

    saveComments() {
        localStorage.setItem("commentsData", JSON.stringify(this.commentsData));
    }

    loadComments() {
        return JSON.parse(localStorage.getItem("commentsData")) || {};
    }

    navigate(direction) {
        const totalCards = this.cards.length;
        if (direction === "prev") {
            this.currentCard = (this.currentCard - 1 + totalCards) % totalCards;
        } else {
            this.currentCard = (this.currentCard + 1) % totalCards;
        }
        this.updateCardDisplay();
    }

    goToCard(index) {
        this.currentCard = index;
        this.updateCardDisplay();
    }

    updateCardDisplay() {
        this.cards.forEach((card, index) => {
            card.style.display = index === this.currentCard ? "block" : "none";
        });

        document.querySelectorAll(".dot").forEach((dot, index) => {
            dot.classList.toggle("active", index === this.currentCard);
        });
    }
}
