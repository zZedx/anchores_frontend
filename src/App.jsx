import { useEffect, useState } from "react";

const localUrl = "http://localhost:3000";
const url = "https://anchors-backend.onrender.com";

const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [randomOtp, setRandomOtp] = useState(0);
  const [otp, setOtp] = useState("");
  const [formSubmit, setFormSubmit] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch(url + "/posts");
      const data = await res.json();
      setPosts(data);
      setContent("");
    }
    fetchPosts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name && !email) return;
    const res = await fetch(url + "/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setRandomOtp(data);
    setFormSubmit(true);
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    if (!otp) return;
    if (otp !== randomOtp) {
      return;
    } else {
      const res = await fetch(url + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, otp }),
      });
      if (res.ok) {
        setLoggedIn(true);
      }
    }
  }
  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content) {
      return;
    } else {
      await fetch(url + "/createPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, content }),
      });
      setPosts((posts) => [
        ...posts,
        { user: { name }, content, comments: [], id: crypto.randomUUID() },
      ]);
      setContent("");
    }
  }

  return (
    <div>
      {!loggedIn && (
        <nav>
          {!formSubmit ? (
            <form action="" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <input
                type="email"
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <button>Send Otp</button>
            </form>
          ) : (
            <form action="" onSubmit={handleOtpSubmit}>
              {/* <h1>{randomOtp}</h1> */}
              <input
                type="number"
                placeholder="otp"
                value={otp}
                onChange={(e) => setOtp(Number(e.target.value))}
              />
              <button>Login</button>
            </form>
          )}
        </nav>
      )}
      <main>
        {loggedIn && (
          <form action="" onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="create post"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button>create</button>
          </form>
        )}
        <h1>All posts</h1>
        <ul>
          {posts &&
            posts.map((post, i) => (
              <li key={i}>
                <h3>Username : {post.user.name}</h3>
                <p>{post.content}</p>
                <Comments
                  post={post}
                  setPosts={setPosts}
                  email={email}
                  name={name}
                />
                <ul>
                  {post.comments.map((comment, i) => (
                    <li key={i}>{comment.comment}</li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      </main>
    </div>
  );
};

function Comments({ post, email, name, setPosts }) {
  const [comment, setComment] = useState("");

  async function handleAddComment(e, post) {
    e.preventDefault();
    console.log(post);
    if (post._id) {
      const id = post._id;
      const res = await fetch(url + "/addComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, id, comment }),
      });
      setPosts((posts) =>
        posts.filter((p) =>
          p.id === id ? { ...p, comments: [...p.comments, comment] } : p
        )
      );
    } else {
      const id = post.id;
      setPosts((posts) =>
        posts.filter((p) =>
          p.id === id ? { ...p, comments: [...p.comments, comment] } : p
        )
      );
    }
    setComment("");
  }
  return (
    <form action="" onSubmit={(e) => handleAddComment(e, post)}>
      <input
        type="text"
        placeholder="Add Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button>Reply</button>
    </form>
  );
}

export default App;
