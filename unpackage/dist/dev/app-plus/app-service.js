if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$7 = {
    props: {
      post: Object,
      currentUser: Object
    },
    data() {
      return {
        commentsVisible: false,
        newComment: "",
        activeReplyInput: null,
        replyTexts: {},
        isLiked: false
        // manually tracked
      };
    },
    mounted() {
      var _a, _b;
      const likeKey = `like_${this.post._id}_${this.currentUser.userId}`;
      try {
        const storedLike = uni.getStorageSync(likeKey);
        if (storedLike !== "") {
          this.isLiked = storedLike === "true";
        } else {
          this.isLiked = (_a = this.post.likes) == null ? void 0 : _a.some((u) => u._id === this.currentUser.userId);
        }
      } catch (e) {
        formatAppLog("error", "at pages/components/PostCard.vue:153", "Storage error:", e);
        this.isLiked = (_b = this.post.likes) == null ? void 0 : _b.some((u) => u._id === this.currentUser.userId);
      }
    },
    methods: {
      toggleLike() {
        this.isLiked = !this.isLiked;
        const likeKey = `like_${this.post._id}_${this.currentUser.userId}`;
        try {
          uni.setStorageSync(likeKey, this.isLiked);
        } catch (e) {
          formatAppLog("error", "at pages/components/PostCard.vue:164", "Failed to save like state:", e);
        }
        this.$emit("like-post", this.post._id, this.isLiked);
      },
      toggleComments() {
        this.commentsVisible = !this.commentsVisible;
      },
      addComment() {
        if (!this.newComment.trim())
          return;
        this.$emit("add-comment", {
          postId: this.post._id,
          commentText: this.newComment
        });
        this.newComment = "";
      },
      showReplyInput(commentId) {
        this.activeReplyInput = this.activeReplyInput === commentId ? null : commentId;
        if (!this.replyTexts[commentId]) {
          this.$set(this.replyTexts, commentId, "");
        }
      },
      addReply(commentId) {
        const replyText = this.replyTexts[commentId];
        if (!replyText || !replyText.trim())
          return;
        this.$emit("add-reply", {
          postId: this.post._id,
          commentId,
          replyText
        });
        this.$set(this.replyTexts, commentId, "");
        this.activeReplyInput = null;
      },
      deletePost() {
        uni.showModal({
          title: "Delete Post",
          content: "Are you sure you want to delete this post?",
          success: (res) => {
            if (res.confirm) {
              this.$emit("delete-post", this.post._id);
            }
          }
        });
      },
      getInitials(username) {
        if (!username)
          return "UU";
        const parts = username.split(" ");
        let initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
          initials += parts[1].charAt(0).toUpperCase();
        } else if (parts[0].length > 1) {
          initials += parts[0].charAt(1).toUpperCase();
        } else {
          initials += initials;
        }
        return initials;
      },
      todoPost() {
        uni.navigateTo({
          url: `/pages/components/worker_todo?postId=${this.post._id}&content=${encodeURIComponent(this.post.content)}`
        });
      },
      formatRelativeTime(dateString) {
        const now = /* @__PURE__ */ new Date();
        const targetDate = new Date(dateString);
        const diffMs = now - targetDate;
        const seconds = Math.floor(diffMs / 1e3);
        const minutes = Math.floor(diffMs / 60 / 1e3);
        const hours = Math.floor(diffMs / 60 / 60 / 1e3);
        const days = Math.floor(diffMs / 24 / 60 / 60 / 1e3);
        const weeks = Math.floor(days / 7);
        if (seconds < 60)
          return "Just now";
        if (minutes < 60)
          return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        if (hours < 24)
          return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        if (days === 1)
          return "Yesterday";
        if (days < 7)
          return `${days} days ago`;
        return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "card" }, [
      vue.createCommentVNode(" Header "),
      vue.createElementVNode("view", { class: "card-header" }, [
        vue.createElementVNode("view", { class: "user-avatar-wrapper" }, [
          $props.post && $props.post.avatar ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            src: $props.post.avatar,
            class: "post-avatar"
          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "user-avatar-text"
            },
            vue.toDisplayString($options.getInitials($props.post.userId === $props.currentUser.userId ? $props.currentUser.username : $props.post.user.username)),
            1
            /* TEXT */
          ))
        ]),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($props.post.user.username),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "timestamp" },
            vue.toDisplayString($options.formatRelativeTime($props.post.createdAt)),
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(' <view v-if="post.userId === currentUser.userId" class="post-actions"> '),
        $props.post.userId === $props.currentUser.userId ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "post-actions"
        }, [
          vue.createElementVNode("text", {
            onClick: _cache[0] || (_cache[0] = (...args) => $options.deletePost && $options.deletePost(...args)),
            class: "delete-btn"
          }, "X")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "post-actions" }, [
          vue.createElementVNode("text", {
            onClick: _cache[1] || (_cache[1] = (...args) => $options.todoPost && $options.todoPost(...args)),
            class: "todo-btn"
          }, "Todo")
        ])
      ]),
      vue.createCommentVNode(" Content "),
      vue.createElementVNode("view", { class: "card-body" }, [
        vue.createElementVNode(
          "text",
          { class: "content" },
          vue.toDisplayString($props.post.content),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" Stats "),
      vue.createElementVNode("view", { class: "card-stats" }, [
        vue.createElementVNode(
          "text",
          { class: "likes-count" },
          vue.toDisplayString($props.post.likes.length) + " likes",
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          {
            onClick: _cache[2] || (_cache[2] = (...args) => $options.toggleComments && $options.toggleComments(...args)),
            class: "comments-count"
          },
          vue.toDisplayString($props.post.comments.length) + " comments",
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" Actions "),
      vue.createElementVNode("view", { class: "card-actions" }, [
        vue.createCommentVNode(` 	<text @click="toggleLike" class="action-btn" :class="{ liked: isLiked }">
	  <text :style="{ color: isLiked ? '#e0245e' : '#65676b' }">
		{{ isLiked ? '❤️' : '♡' }}
	  </text> {{ isLiked ? 'Liked' : 'Like' }}
	</text> `),
        vue.createElementVNode(
          "text",
          {
            onClick: _cache[3] || (_cache[3] = (...args) => $options.toggleLike && $options.toggleLike(...args)),
            class: vue.normalizeClass(["action-btn", { liked: $data.isLiked }])
          },
          [
            vue.createElementVNode(
              "text",
              {
                style: vue.normalizeStyle({ color: $data.isLiked ? "#65676b" : "#65676b" })
              },
              vue.toDisplayString($data.isLiked ? "♡" : "♡"),
              5
              /* TEXT, STYLE */
            ),
            vue.createTextVNode(
              " " + vue.toDisplayString($data.isLiked ? "Like" : "Like"),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("text", {
          onClick: _cache[4] || (_cache[4] = (...args) => $options.toggleComments && $options.toggleComments(...args)),
          class: "action-btn"
        }, [
          vue.createElementVNode("text", null, "💬"),
          vue.createTextVNode(" Comment ")
        ])
      ]),
      vue.createCommentVNode(" Comments "),
      $data.commentsVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "comment-section"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($props.post.comments, (comment) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: comment._id,
              class: "comment-item"
            }, [
              vue.createElementVNode(
                "view",
                { class: "comment-avatar-text" },
                vue.toDisplayString($options.getInitials(comment.user.username)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "comment-content" }, [
                vue.createElementVNode("view", { class: "comment-text" }, [
                  vue.createElementVNode("view", { class: "comment-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "comment-user" },
                      vue.toDisplayString(comment.user.username),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "timestamp" },
                      vue.toDisplayString($options.formatRelativeTime(comment.createdAt)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(comment.text),
                    1
                    /* TEXT */
                  )
                ]),
                comment.replies.length ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "replies-container"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(comment.replies, (reply) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: reply._id,
                        class: "reply-item"
                      }, [
                        vue.createElementVNode(
                          "view",
                          { class: "reply-avatar-text" },
                          vue.toDisplayString($options.getInitials(reply.user.username)),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "reply-content" }, [
                          vue.createElementVNode("view", { class: "reply-header" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "reply-user" },
                              vue.toDisplayString(reply.user.username),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "timestamp" },
                              vue.toDisplayString($options.formatRelativeTime(reply.createdAt)),
                              1
                              /* TEXT */
                            )
                          ]),
                          vue.createElementVNode(
                            "text",
                            { class: "reply-text" },
                            vue.toDisplayString(reply.text),
                            1
                            /* TEXT */
                          )
                        ])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", { class: "reply_con" }, [
                  vue.createElementVNode("text", {
                    onClick: ($event) => $options.showReplyInput(comment._id),
                    class: "reply-btn"
                  }, " Reply ", 8, ["onClick"])
                ]),
                $data.activeReplyInput === comment._id ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "reply-input"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "comment-avatar-text" },
                    vue.toDisplayString($options.getInitials($props.currentUser.username)),
                    1
                    /* TEXT */
                  ),
                  vue.withDirectives(vue.createElementVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.replyTexts[comment._id] = $event,
                    placeholder: "Write a reply...",
                    onKeyup: vue.withKeys(($event) => $options.addReply(comment._id), ["enter"])
                  }, null, 40, ["onUpdate:modelValue", "onKeyup"]), [
                    [vue.vModelText, $data.replyTexts[comment._id]]
                  ]),
                  vue.createElementVNode("text", {
                    onClick: ($event) => $options.addReply(comment._id),
                    class: "send-reply-btn"
                  }, "Send", 8, ["onClick"])
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createElementVNode("view", { class: "new-comment" }, [
          vue.createElementVNode(
            "view",
            { class: "comment-avatar-text" },
            vue.toDisplayString($options.getInitials($props.currentUser.username)),
            1
            /* TEXT */
          ),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.newComment = $event),
              placeholder: "Write a comment...",
              onKeyup: _cache[6] || (_cache[6] = vue.withKeys((...args) => $options.addComment && $options.addComment(...args), ["enter"]))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.newComment]
          ]),
          vue.createElementVNode("text", {
            onClick: _cache[7] || (_cache[7] = (...args) => $options.addComment && $options.addComment(...args)),
            class: "send-comment-btn"
          }, "Send")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PostCard = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-8e0ecb97"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/components/PostCard.vue"]]);
  const _sfc_main$6 = {
    components: { PostCard },
    data() {
      return {
        currentUser: null,
        newPostContent: "",
        showPostButton: false,
        posts: [],
        loading: false
      };
    },
    async onLoad() {
      const token = uni.getStorageSync("token");
      if (!token) {
        uni.redirectTo({ url: "/pages/auth/login" });
        return;
      }
      const storedUser = uni.getStorageSync("user");
      if (storedUser && (storedUser.userId || storedUser.id || storedUser._id)) {
        this.currentUser = {
          userId: storedUser.userId || storedUser.id || storedUser._id,
          username: storedUser.username,
          email: storedUser.email,
          avatar: storedUser.avatar || "/static/default-avatar.png"
        };
      } else {
        uni.removeStorageSync("token");
        uni.removeStorageSync("user");
        uni.redirectTo({ url: "/pages/auth/login" });
        return;
      }
      await this.fetchPosts();
    },
    methods: {
      getInitials(username) {
        formatAppLog("log", "at pages/index/index.vue:91", "usertest", username);
        if (!username)
          return "UU";
        const parts = username.split(" ");
        let initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
          initials += parts[1].charAt(0).toUpperCase();
        } else if (parts[0].length > 1) {
          initials += parts[0].charAt(1).toUpperCase();
        } else {
          initials += initials;
        }
        return initials;
      },
      async fetchPosts() {
        this.loading = true;
        try {
          const res = await uni.request({
            url: "https://worker-post-backend.onrender.com/api/posts",
            header: {
              "x-auth-token": uni.getStorageSync("token")
            }
          });
          this.posts = res.data || this.getMockPosts();
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:117", "Fetch posts error:", error);
          this.posts = this.getMockPosts();
          uni.showToast({
            title: "Using mock data",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      getMockPosts() {
        return [
          {
            _id: "mock-" + Date.now(),
            username: "Demo User",
            userId: "demo-123",
            avatar: "/static/avatar.png",
            timestamp: "Just now",
            content: "This is sample post",
            likes: [],
            comments: []
          }
        ];
      },
      async addPost() {
        var _a, _b, _c;
        if (!this.newPostContent.trim())
          return;
        try {
          const res = await uni.request({
            url: "https://worker-post-backend.onrender.com/api/posts",
            method: "POST",
            header: {
              "x-auth-token": uni.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              content: this.newPostContent
            }
          });
          const newPost = (res == null ? void 0 : res.data) || {
            _id: "mock-" + Date.now(),
            username: ((_a = this.currentUser) == null ? void 0 : _a.username) || "Unknown User",
            userId: ((_b = this.currentUser) == null ? void 0 : _b.userId) || "unknown",
            avatar: ((_c = this.currentUser) == null ? void 0 : _c.avatar) || "/static/default-avatar.png",
            timestamp: "Just now",
            content: this.newPostContent,
            likes: [],
            comments: []
          };
          this.posts.unshift(newPost);
          this.newPostContent = "";
          this.showPostButton = false;
          uni.showToast({
            title: "Posted successfully",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:179", "Create post error:", error);
          uni.showToast({
            title: "Failed to post",
            icon: "none"
          });
        }
      },
      async handleLike(postId) {
        try {
          const post = this.posts.find((p) => p._id === postId);
          if (!post) {
            formatAppLog("error", "at pages/index/index.vue:191", "Post not found:", postId);
            return;
          }
          const hasLiked = post.likes.includes(this.currentUser.userId);
          const method = hasLiked ? "DELETE" : "POST";
          const res = await uni.request({
            url: `https://worker-post-backend.onrender.com/api/posts/${postId}/like`,
            method: "PUT",
            header: {
              "x-auth-token": uni.getStorageSync("token"),
              "Content-Type": "application/json"
            }
          });
          if (!res || res.statusCode !== 200) {
            throw new Error("Failed to update like");
          }
          const updatedPost = res.data;
          const index = this.posts.findIndex((p) => p._id === postId);
          if (index !== -1) {
            this.posts.splice(index, 1, updatedPost);
          }
          uni.showToast({
            title: hasLiked ? "Unliked" : "Liked",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:223", "Like failed:", error);
          uni.showToast({
            title: error.message || "Failed to update like",
            icon: "none"
          });
        }
      },
      async handleAddComment({ postId, commentText }) {
        var _a, _b;
        const post = this.posts.find((p) => p._id === postId);
        if (!post)
          return;
        try {
          const res = await uni.request({
            url: `https://worker-post-backend.onrender.com/api/posts/${postId}/comments`,
            method: "POST",
            header: {
              "x-auth-token": uni.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              text: commentText
            }
          });
          const comment = res.data || {
            _id: `comment-${Date.now()}`,
            user: ((_a = this.currentUser) == null ? void 0 : _a.username) || "Anonymous",
            userId: ((_b = this.currentUser) == null ? void 0 : _b.userId) || "unknown",
            text: commentText,
            timestamp: "Just now",
            replies: []
          };
          post.comments.unshift(comment);
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:259", "Add comment failed:", error);
          uni.showToast({ title: "Failed to add comment", icon: "none" });
        }
      },
      async handleAddReply({ postId, commentId, replyText }) {
        var _a, _b;
        const post = this.posts.find((p) => p._id === postId);
        if (!post)
          return;
        const comment = post.comments.find((c) => c._id === commentId);
        if (!comment)
          return;
        try {
          const res = await uni.request({
            url: `https://worker-post-backend.onrender.com/api/posts/${postId}/comments/${commentId}/replies`,
            method: "POST",
            header: {
              "x-auth-token": uni.getStorageSync("token"),
              "Content-Type": "application/json"
            },
            data: {
              text: replyText
            }
          });
          const newReply = res.data || {
            _id: `reply-${Date.now()}`,
            user: ((_a = this.currentUser) == null ? void 0 : _a.username) || "Anonymous",
            userId: ((_b = this.currentUser) == null ? void 0 : _b.userId) || "unknown",
            text: replyText,
            timestamp: "Just now"
          };
          comment.replies.push(newReply);
          uni.showToast({
            title: "Reply added",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:300", "Add reply failed:", error);
          uni.showToast({ title: "Failed to add reply", icon: "none" });
        }
      },
      handleDeletePost(postId) {
        uni.showModal({
          title: "Delete Post",
          content: "Are you sure?",
          success: (res) => {
            if (res.confirm) {
              this.posts = this.posts.filter((post) => post._id !== postId);
            }
          }
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    const _component_PostCard = vue.resolveComponent("PostCard");
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "new-post" }, [
        vue.createElementVNode("view", { class: "user-avatar-wrapper" }, [
          _ctx.post && _ctx.post.avatar ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            src: _ctx.post.avatar,
            class: "post-avatar"
          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "user-avatar-text"
            },
            vue.toDisplayString($options.getInitials((_a = $data.currentUser) == null ? void 0 : _a.username)),
            1
            /* TEXT */
          ))
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.newPostContent = $event),
            placeholder: "What's on your mind?",
            onFocus: _cache[1] || (_cache[1] = ($event) => $data.showPostButton = true)
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $data.newPostContent]
        ]),
        $data.showPostButton ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          onClick: _cache[2] || (_cache[2] = (...args) => $options.addPost && $options.addPost(...args)),
          class: "post-button",
          disabled: !$data.newPostContent.trim()
        }, " Post ", 8, ["disabled"])) : vue.createCommentVNode("v-if", true)
      ]),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, [
        vue.createElementVNode("text", null, "Loading posts...")
      ])) : vue.createCommentVNode("v-if", true),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($data.posts, (post, index) => {
          return vue.openBlock(), vue.createBlock(_component_PostCard, {
            key: post._id || index,
            post,
            "current-user": $data.currentUser,
            onLikePost: $options.handleLike,
            onAddComment: $options.handleAddComment,
            onAddReply: $options.handleAddReply,
            onDeletePost: $options.handleDeletePost
          }, null, 8, ["post", "current-user", "onLikePost", "onAddComment", "onAddReply", "onDeletePost"]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/index/index.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        email: "",
        password: "",
        loading: false,
        currentUser: null
        // Add this line
      };
    },
    // Removed onLoad from here - it shouldn't be in login page
    methods: {
      async handleLogin() {
        var _a;
        if (!this.email || !this.password) {
          uni.showToast({
            title: "Please fill all fields",
            icon: "none"
          });
          return;
        }
        this.loading = true;
        try {
          formatAppLog("log", "at pages/auth/login.vue:62", "Sending login request...");
          const response = await uni.request({
            url: "https://worker-post-backend.onrender.com/api/users/login",
            method: "POST",
            data: {
              email: this.email,
              password: this.password
            },
            header: {
              "Content-Type": "application/json"
            }
          });
          formatAppLog("log", "at pages/auth/login.vue:75", "Raw response:", response);
          if (response.statusCode >= 400) {
            throw new Error(response.errMsg || "Network error");
          }
          const responseData = response.data || ((_a = response[1]) == null ? void 0 : _a.data);
          if (!responseData) {
            formatAppLog("error", "at pages/auth/login.vue:85", "Invalid response structure:", response);
            throw new Error("Invalid server response");
          }
          if (responseData.token) {
            formatAppLog("log", "at pages/auth/login.vue:91", "Login user data:", responseData.user);
            if (!responseData.user.userId) {
              responseData.user.userId = responseData.user.id || responseData.user._id;
            }
            uni.setStorageSync("token", responseData.token);
            uni.setStorageSync("user", responseData.user);
            this.currentUser = responseData.user;
            uni.switchTab({ url: "/pages/index/index" });
            uni.showToast({
              title: `Welcome back, ${responseData.user.username}!`,
              icon: "none"
            });
            return;
          }
          throw new Error(responseData.message || "Login failed");
        } catch (error) {
          formatAppLog("error", "at pages/auth/login.vue:133", "Login error details:", error);
          uni.showToast({
            title: error.message || "Login failed",
            icon: "none",
            duration: 3e3
          });
        } finally {
          this.loading = false;
        }
      },
      goToRegister() {
        uni.navigateTo({ url: "/pages/auth/register" });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-card" }, [
        vue.createElementVNode("text", { class: "title" }, "Welcome Back"),
        vue.createElementVNode("text", { class: "subtitle" }, "Please login to continue"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.email = $event),
            class: "input",
            placeholder: "Enter your email",
            type: "email"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.email]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
            class: "input",
            placeholder: "Enter your password",
            type: "password"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.password]
        ]),
        vue.createElementVNode("button", {
          class: "login-button",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleLogin && $options.handleLogin(...args)),
          disabled: $data.loading
        }, vue.toDisplayString($data.loading ? "Logging in..." : "Login"), 9, ["disabled"]),
        vue.createElementVNode("view", { class: "footer" }, [
          vue.createElementVNode("text", null, "Don't have an account?"),
          vue.createElementVNode("text", {
            class: "register-link",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.goToRegister && $options.goToRegister(...args))
          }, " Register")
        ])
      ])
    ]);
  }
  const PagesAuthLogin = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-2cc9f8c3"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/auth/login.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        username: "",
        email: "",
        password: "",
        loading: false
      };
    },
    methods: {
      async handleRegister() {
        if (!this.username || !this.email || !this.password) {
          uni.showToast({
            title: "Please fill all fields",
            icon: "none"
          });
          return;
        }
        this.loading = true;
        try {
          const response = await uni.request({
            url: "https://worker-post-backend.onrender.com/api/users/register",
            method: "POST",
            data: {
              username: this.username,
              email: this.email,
              password: this.password
            }
          });
          uni.showToast({
            title: "Registration successful!",
            icon: "success"
          });
          this.goToLogin();
        } catch (error) {
          formatAppLog("error", "at pages/auth/register.vue:64", "Registration error:", error);
          uni.showToast({
            title: "Registration failed",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      goToLogin() {
        uni.navigateTo({ url: "/pages/auth/login" });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("view", { class: "register-card" }, [
        vue.createElementVNode("text", { class: "title" }, "Create Account"),
        vue.createElementVNode("view", { class: "" }, [
          vue.createElementVNode("text", { class: "subtitle" }, "Join us today - it’s free!")
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.username = $event),
            placeholder: "Username",
            class: "input"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.username]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.email = $event),
            placeholder: "Email",
            type: "email",
            class: "input"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.email]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.password = $event),
            placeholder: "Password",
            type: "password",
            class: "input"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.password]
        ]),
        vue.createElementVNode("button", {
          class: "register-button",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.handleRegister && $options.handleRegister(...args)),
          disabled: $data.loading
        }, vue.toDisplayString($data.loading ? "Registering..." : "Register"), 9, ["disabled"]),
        vue.createElementVNode("view", { class: "footer" }, [
          vue.createElementVNode("text", null, "Already have an account?"),
          vue.createElementVNode("text", {
            class: "login-link",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.goToLogin && $options.goToLogin(...args))
          }, " Login")
        ])
      ])
    ]);
  }
  const PagesAuthRegister = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-4bb68961"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/auth/register.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        currentUser: {},
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        userPosts: [],
        loading: false
      };
    },
    async onLoad() {
      await this.loadProfileData();
    },
    methods: {
      async loadProfileData() {
        this.loading = true;
        try {
          const user = uni.getStorageSync("user");
          if (!user) {
            uni.redirectTo({ url: "/pages/auth/login" });
            return;
          }
          this.currentUser = user;
        } catch (error) {
          formatAppLog("error", "at pages/profile/profile.vue:97", "Profile load error:", error);
          uni.showToast({
            title: "Failed to load profile",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      getInitials(username) {
        if (!username)
          return "UU";
        const parts = username.split(" ");
        let initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
          initials += parts[1].charAt(0).toUpperCase();
        }
        return initials;
      },
      handleLike(postId) {
      },
      handleDeletePost(postId) {
        this.userPosts = this.userPosts.filter((post) => post._id !== postId);
        this.postsCount--;
      },
      navigateToSettings() {
        uni.navigateTo({ url: "/pages/profile/settings" });
      },
      handleLogout() {
        uni.showModal({
          title: "Logout",
          content: "Are you sure you want to logout?",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("user");
              uni.reLaunch({ url: "/pages/auth/login" });
            }
          }
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createCommentVNode(" Profile Header "),
      vue.createElementVNode("view", { class: "profile-header" }, [
        vue.createElementVNode("view", { class: "avatar-container" }, [
          vue.createElementVNode(
            "view",
            { class: "avatar-large" },
            vue.toDisplayString($options.getInitials($data.currentUser.username)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode(
          "text",
          { class: "username" },
          vue.toDisplayString($data.currentUser.username),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "email" },
          vue.toDisplayString($data.currentUser.email),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" Profile Stats "),
      vue.createElementVNode("view", { class: "profile-stats" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.postsCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "Posts")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.followersCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "Followers")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.followingCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "Following")
        ])
      ]),
      vue.createCommentVNode(" Settings and Logout "),
      vue.createElementVNode("view", { class: "profile-actions" }, [
        vue.createElementVNode("button", {
          class: "action-button",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.navigateToSettings && $options.navigateToSettings(...args))
        }, " Settings "),
        vue.createElementVNode("button", {
          class: "action-button logout",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, " Logout ")
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-dd383ca2"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/profile/profile.vue"]]);
  const _sfc_main$2 = {
    methods: {
      navigateToEditProfile() {
        uni.navigateTo({ url: "/pages/profile/edit" });
      },
      navigateToChangePassword() {
        uni.navigateTo({ url: "/pages/profile/change-password" });
      },
      navigateToPrivacy() {
        uni.navigateTo({ url: "/pages/profile/privacy" });
      },
      handleLogout() {
        uni.showModal({
          title: "Logout",
          content: "Are you sure you want to logout?",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("user");
              uni.reLaunch({ url: "/pages/auth/login" });
            }
          }
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-container" }, [
      vue.createElementVNode("view", { class: "settings-header" }, [
        vue.createElementVNode("text", { class: "settings-title" }, "Settings")
      ]),
      vue.createElementVNode("view", { class: "settings-list" }, [
        vue.createElementVNode("view", {
          class: "settings-item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.navigateToEditProfile && $options.navigateToEditProfile(...args))
        }, [
          vue.createElementVNode("text", null, "Edit Profile"),
          vue.createElementVNode("text", null, "›")
        ]),
        vue.createElementVNode("view", {
          class: "settings-item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.navigateToChangePassword && $options.navigateToChangePassword(...args))
        }, [
          vue.createElementVNode("text", null, "Change Password"),
          vue.createElementVNode("text", null, "›")
        ]),
        vue.createElementVNode("view", {
          class: "settings-item",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.navigateToPrivacy && $options.navigateToPrivacy(...args))
        }, [
          vue.createElementVNode("text", null, "Privacy Settings"),
          vue.createElementVNode("text", null, "›")
        ]),
        vue.createElementVNode("view", {
          class: "settings-item",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, [
          vue.createElementVNode("text", { class: "logout-text" }, "Logout"),
          vue.createElementVNode("text", null, "›")
        ])
      ])
    ]);
  }
  const PagesProfileSettings = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-eeefe5cd"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/profile/settings.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        userID: "",
        userContent: "",
        newTask: "",
        tasks: [],
        editIndex: null,
        editText: ""
      };
    },
    onLoad(options) {
      const postId = options.postId;
      const content = decodeURIComponent(options.content);
      this.postId = postId;
      this.postContent = content;
      formatAppLog("log", "at pages/components/worker_todo.vue:73", "Post ID:", postId);
      formatAppLog("log", "at pages/components/worker_todo.vue:74", "Content:", content);
      this.fetchTasks();
    },
    methods: {
      fetchTasks() {
        uni.request({
          url: "https://worker-post-backend.onrender.com/api/tasks",
          method: "GET",
          success: (res) => {
            if (Array.isArray(res.data)) {
              this.tasks = res.data.map((item) => ({
                id: item._id,
                text: item.task,
                content: item.content,
                user_time: item.user_time,
                createdAt: item.createdAt,
                status: item.state,
                showActions: false
                // NEW
              }));
            } else {
              formatAppLog("error", "at pages/components/worker_todo.vue:94", "Invalid data format:", res.data);
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/components/worker_todo.vue:98", "Fetch failed", err);
          }
        });
      },
      addTask() {
        if (!this.newTask.trim())
          return;
        uni.request({
          url: "https://worker-post-backend.onrender.com/api/tasks",
          method: "POST",
          data: {
            userID: this.userID,
            userContent: this.userContent,
            task: this.newTask,
            state: "pending",
            user_time: (/* @__PURE__ */ new Date()).toISOString(),
            postId: this.postId,
            content: this.postContent
          },
          success: () => {
            this.newTask = "";
            this.fetchTasks();
            uni.showToast({
              title: "Task added ✅",
              icon: "success",
              duration: 1500
            });
          },
          fail: (err) => {
            formatAppLog("error", "at pages/components/worker_todo.vue:128", "Add failed", err);
          }
        });
      },
      formatRelativeTime(dateString) {
        const now = /* @__PURE__ */ new Date();
        const targetDate = new Date(dateString);
        const diffMs = now - targetDate;
        const seconds = Math.floor(diffMs / 1e3);
        const minutes = Math.floor(diffMs / 60 / 1e3);
        const hours = Math.floor(diffMs / 60 / 60 / 1e3);
        const days = Math.floor(diffMs / 24 / 60 / 60 / 1e3);
        const weeks = Math.floor(days / 7);
        if (seconds < 60)
          return "Just now";
        if (minutes < 60)
          return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        if (hours < 24)
          return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        if (days === 1)
          return "Yesterday";
        if (days < 7)
          return `${days} days ago`;
        return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
      },
      updateTaskStatus(index, newState) {
        const task = this.tasks[index];
        uni.request({
          url: `https://worker-post-backend.onrender.com/api/tasks/${task.id}`,
          method: "PATCH",
          data: {
            task: task.text,
            state: newState,
            user_time: (/* @__PURE__ */ new Date()).toISOString()
          },
          success: () => {
            this.fetchTasks();
          },
          fail: (err) => {
            formatAppLog("error", "at pages/components/worker_todo.vue:165", "Update failed", err);
          }
        });
      },
      startCheck(index) {
        this.updateTaskStatus(index, "working");
      },
      notWork(index) {
        this.updateTaskStatus(index, "pending");
      },
      markAsDone(index) {
        this.updateTaskStatus(index, "done");
        uni.showToast({
          title: "Task completed ✅",
          icon: "success",
          duration: 1500
        });
      },
      deleteTask(index) {
        const task = this.tasks[index];
        uni.request({
          url: `https://worker-post-backend.onrender.com/api/tasks/${task.id}`,
          method: "DELETE",
          success: () => {
            this.fetchTasks();
            uni.showToast({
              title: "Task deleted 🗑",
              icon: "success",
              duration: 1500
            });
          },
          fail: (err) => {
            formatAppLog("error", "at pages/components/worker_todo.vue:201", "Delete failed", err);
          }
        });
      },
      startEdit(index) {
        this.editIndex = index;
        this.editText = this.tasks[index].text;
      },
      saveEdit(index) {
        if (!this.editText.trim())
          return;
        const task = this.tasks[index];
        uni.request({
          url: `https://worker-post-backend.onrender.com/api/tasks/${task.id}`,
          method: "PATCH",
          data: {
            task: this.editText,
            state: task.status,
            user_time: (/* @__PURE__ */ new Date()).toISOString()
          },
          success: () => {
            this.editIndex = null;
            this.editText = "";
            this.fetchTasks();
            uni.showToast({
              title: "Task updated ✏️",
              icon: "success",
              duration: 1500
            });
          },
          fail: (err) => {
            formatAppLog("error", "at pages/components/worker_todo.vue:233", "Edit failed", err);
          }
        });
      },
      cancelEdit() {
        this.editIndex = null;
        this.editText = "";
      },
      toggleActions(index) {
        this.tasks[index].showActions = !this.tasks[index].showActions;
      },
      getStatusLabel(status) {
        if (status === "done")
          return "✔ ပြီးသွားပါပြီ";
        if (status === "working")
          return "🔄 လုပ်နေပါသည်";
        return "⏸ မလုပ်သေးပါ";
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.newTask = $event),
            placeholder: "လုပ်စရာရေးပါ...",
            onConfirm: _cache[1] || (_cache[1] = (...args) => $options.addTask && $options.addTask(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $data.newTask]
        ]),
        vue.createElementVNode("button", {
          class: "add-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.addTask && $options.addTask(...args))
        }, "➕ ထည့်မယ်")
      ]),
      vue.createElementVNode("view", { class: "task-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tasks, (task, index) => {
            return vue.openBlock(), vue.createElementBlock(
              "view",
              {
                class: vue.normalizeClass(["task-item", task.status]),
                key: task.id
              },
              [
                vue.createElementVNode("view", { class: "task-text" }, [
                  $data.editIndex === index ? vue.withDirectives((vue.openBlock(), vue.createElementBlock(
                    "input",
                    {
                      key: 0,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.editText = $event),
                      class: "edit-input"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  )), [
                    [vue.vModelText, $data.editText]
                  ]) : (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    { key: 1 },
                    [
                      vue.createElementVNode("view", { class: "task_item" }, [
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["task-label", task.status])
                          },
                          vue.toDisplayString(task.text),
                          3
                          /* TEXT, CLASS */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "status-label" },
                          vue.toDisplayString($options.getStatusLabel(task.status)),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { style: { "display": "flex", "flex-direction": "column" } }, [
                        vue.createElementVNode(
                          "text",
                          { style: { "font-size": "12px", "color": "#748cab", "margin-left": "6px" } },
                          vue.toDisplayString($options.formatRelativeTime(task.createdAt)),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["task-label", task.status])
                          },
                          vue.toDisplayString(task.content),
                          3
                          /* TEXT, CLASS */
                        ),
                        vue.createElementVNode(
                          "text",
                          { style: { "font-size": "12px", "color": "#748cab", "margin-left": "6px" } },
                          vue.toDisplayString($options.formatRelativeTime(task.user_time)) + " တွင်ပြင်ဆင်ခဲ့သည်။",
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                vue.createCommentVNode(" Show Actions Only When See More is Toggled "),
                task.showActions ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "action-group"
                }, [
                  vue.createElementVNode("view", { class: "actions" }, [
                    vue.createElementVNode("button", {
                      class: "start-btn",
                      onClick: ($event) => $options.startCheck(index)
                    }, "✅ စတင်", 8, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "pause-btn",
                      onClick: ($event) => $options.notWork(index)
                    }, "⏸ မလုပ်သေး", 8, ["onClick"]),
                    task.status === "working" ? (vue.openBlock(), vue.createElementBlock("button", {
                      key: 0,
                      class: "success-btn",
                      onClick: ($event) => $options.markAsDone(index)
                    }, "✅ အောင်မြင်", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createElementVNode("view", { class: "actions" }, [
                    $data.editIndex === index ? (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      { key: 0 },
                      [
                        vue.createElementVNode("button", {
                          class: "add-btn",
                          onClick: ($event) => $options.saveEdit(index)
                        }, "💾 သိမ်းမယ်", 8, ["onClick"]),
                        vue.createElementVNode("button", {
                          class: "delete-btn",
                          onClick: _cache[4] || (_cache[4] = (...args) => $options.cancelEdit && $options.cancelEdit(...args))
                        }, "❌ မပြင်တော့ဘူး")
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    )) : (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      { key: 1 },
                      [
                        vue.createElementVNode("button", {
                          class: "edit-btn",
                          onClick: ($event) => $options.startEdit(index)
                        }, "✏ ပြင်မယ်", 8, ["onClick"]),
                        vue.createElementVNode("button", {
                          class: "delete-btn",
                          onClick: ($event) => $options.deleteTask(index)
                        }, "🗑 ဖျက်မယ်", 8, ["onClick"])
                      ],
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" See More Toggle "),
                vue.createElementVNode("view", {
                  style: { "background-color": "#29B6F6", "font-size": "13px", "color": "white", "width": "28%", "text-align": "center", "border-radius": "6px", "padding": "6px" },
                  onClick: ($event) => $options.toggleActions(index)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(task.showActions ? "Hide" : "See More"),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"])
              ],
              2
              /* CLASS */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesComponentsWorkerTodo = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/components/worker_todo.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/auth/login", PagesAuthLogin);
  __definePage("pages/auth/register", PagesAuthRegister);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/profile/settings", PagesProfileSettings);
  __definePage("pages/components/worker_todo", PagesComponentsWorkerTodo);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
