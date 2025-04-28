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
  function formatRelativeTime(dateString) {
    const now = /* @__PURE__ */ new Date();
    const postDate = new Date(dateString);
    const diffMs = now - postDate;
    const seconds = Math.floor(diffMs / 1e3);
    const minutes = Math.floor(diffMs / (1e3 * 60));
    const hours = Math.floor(diffMs / (1e3 * 60 * 60));
    const days = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
    const weeks = Math.floor(diffMs / (1e3 * 60 * 60 * 24 * 7));
    if (seconds < 60)
      return "Just now";
    if (minutes < 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1)
      return "Yesterday";
    if (days < 7)
      return `${days} days ago`;
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$4 = {
    props: {
      post: Object,
      currentUser: Object
    },
    data() {
      return {
        commentsVisible: false,
        newComment: "",
        activeReplyInput: null,
        replyTexts: {}
      };
    },
    computed: {
      isLiked() {
        var _a;
        return ((_a = this.post.likes) == null ? void 0 : _a.includes(this.currentUser.userId)) || false;
      },
      formattedPostTime() {
        return formatRelativeTime(this.post.createdAt);
      }
    },
    methods: {
      getAvatar(userId) {
        return userId === this.currentUser.userId ? this.currentUser.avatar : "/static/logo.png";
      },
      toggleLike() {
        this.$emit("like-post", this.post._id);
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
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "card" }, [
      vue.createElementVNode("view", { class: "card-header" }, [
        vue.createElementVNode("view", { class: "user-avatar-wrapper" }, [
          $props.post.userId === $props.currentUser.userId && $props.currentUser.avatar && $props.currentUser.avatar !== "/static/default-avatar.png" || $props.post.user.avatar && $props.post.user.avatar !== "/static/default-avatar.png" ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            class: "user-avatar",
            src: $props.post.userId === $props.currentUser.userId ? $props.currentUser.avatar : $props.post.user.avatar,
            mode: "aspectFill"
          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "user-avatar-text"
            },
            vue.toDisplayString(((_a = $props.post.userId === $props.currentUser.userId ? $props.currentUser.username : $props.post.user.username) == null ? void 0 : _a.charAt(0).toUpperCase()) || "U"),
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
            vue.toDisplayString($options.formattedPostTime),
            1
            /* TEXT */
          )
        ]),
        $props.post.userId === $props.currentUser.userId ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "post-actions"
        }, [
          vue.createElementVNode("button", {
            onClick: _cache[0] || (_cache[0] = (...args) => $options.deletePost && $options.deletePost(...args)),
            class: "delete-btn"
          }, "✕")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "card-body" }, [
        vue.createElementVNode(
          "text",
          { class: "content" },
          vue.toDisplayString($props.post.content),
          1
          /* TEXT */
        )
      ]),
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
          { class: "comments-count" },
          vue.toDisplayString($props.post.comments.length) + " comments",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "card-actions" }, [
        vue.createElementVNode(
          "text",
          {
            onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleLike && $options.toggleLike(...args)),
            class: vue.normalizeClass(["action-btn", { liked: $options.isLiked }])
          },
          [
            vue.createElementVNode(
              "text",
              {
                style: vue.normalizeStyle({ color: $options.isLiked ? "#e0245e" : "#65676b" })
              },
              vue.toDisplayString($options.isLiked ? "ting" : "♡"),
              5
              /* TEXT, STYLE */
            ),
            vue.createTextVNode(" Like ")
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("text", {
          onClick: _cache[2] || (_cache[2] = (...args) => $options.toggleComments && $options.toggleComments(...args)),
          class: "action-btn"
        }, [
          vue.createElementVNode("text", null, "💬"),
          vue.createTextVNode(" Comment ")
        ])
      ]),
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
              vue.createElementVNode("image", {
                class: "comment-avatar",
                src: $options.getAvatar(comment.userId)
              }, null, 8, ["src"]),
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
                      vue.toDisplayString($options.formattedPostTime),
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
                        vue.createElementVNode("image", {
                          class: "reply-avatar",
                          src: $options.getAvatar(reply.userId)
                        }, null, 8, ["src"]),
                        vue.createElementVNode("view", { class: "reply-content" }, [
                          vue.createElementVNode("view", { class: "reply-header" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "reply-user" },
                              vue.toDisplayString(reply.user.username),
                              1
                              /* TEXT */
                            ),
                            vue.createCommentVNode(' <text class="reply-time">{{ reply.createdAt }}</text> '),
                            vue.createElementVNode(
                              "text",
                              { class: "timestamp" },
                              vue.toDisplayString($options.formattedPostTime),
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
                  vue.withDirectives(vue.createElementVNode("input", {
                    "onUpdate:modelValue": ($event) => $data.replyTexts[comment._id] = $event,
                    placeholder: "Write a reply...",
                    onKeyup: vue.withKeys(($event) => $options.addReply(comment._id), ["enter"])
                  }, null, 40, ["onUpdate:modelValue", "onKeyup"]), [
                    [vue.vModelText, $data.replyTexts[comment._id]]
                  ]),
                  vue.createElementVNode("button", {
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
          vue.createElementVNode("image", {
            class: "comment-avatar",
            src: $props.currentUser.avatar
          }, null, 8, ["src"]),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.newComment = $event),
              placeholder: "Write a comment...",
              onKeyup: _cache[4] || (_cache[4] = vue.withKeys((...args) => $options.addComment && $options.addComment(...args), ["enter"]))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.newComment]
          ]),
          vue.createElementVNode("button", {
            onClick: _cache[5] || (_cache[5] = (...args) => $options.addComment && $options.addComment(...args)),
            class: "send-comment-btn"
          }, "Send")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PostCard = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-8e0ecb97"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/components/PostCard.vue"]]);
  const _sfc_main$3 = {
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
      if (storedUser && storedUser.userId) {
        this.currentUser = storedUser;
      } else {
        this.currentUser = {
          username: "Guest",
          avatar: "/static/default-avatar.png",
          userId: "guest-" + Math.random().toString(36).substring(2, 9)
        };
        uni.setStorageSync("user", this.currentUser);
      }
      await this.fetchPosts();
    },
    methods: {
      async fetchPosts() {
        this.loading = true;
        try {
          const res = await uni.request({
            url: "http://localhost:3000/api/posts",
            header: {
              "x-auth-token": uni.getStorageSync("token")
            }
          });
          this.posts = res.data || this.getMockPosts();
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:100", "Fetch posts error:", error);
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
            url: "http://localhost:3000/api/posts",
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
          formatAppLog("error", "at pages/index/index.vue:162", "Create post error:", error);
          uni.showToast({
            title: "Failed to post",
            icon: "none"
          });
        }
      },
      // ✅ Updated like with API
      async handleLike(postId) {
        try {
          const post = this.posts.find((p) => p._id === postId);
          if (!post) {
            formatAppLog("error", "at pages/index/index.vue:175", "Post not found:", postId);
            return;
          }
          const hasLiked = post.likes.includes(this.currentUser.userId);
          const method = hasLiked ? "DELETE" : "POST";
          const res = await uni.request({
            url: `http://localhost:3000/api/posts/${postId}/like`,
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
          formatAppLog("error", "at pages/index/index.vue:207", "Like failed:", error);
          uni.showToast({
            title: error.message || "Failed to update like",
            icon: "none"
          });
        }
      },
      // ✅ Updated comment with API
      async handleAddComment({ postId, commentText }) {
        var _a, _b;
        const post = this.posts.find((p) => p._id === postId);
        if (!post)
          return;
        try {
          const res = await uni.request({
            url: `http://localhost:3000/api/posts/${postId}/comments`,
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
          formatAppLog("error", "at pages/index/index.vue:245", "Add comment failed:", error);
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
            url: `http://localhost:3000/api/posts/${postId}/comments/${commentId}/replies`,
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
          formatAppLog("error", "at pages/index/index.vue:286", "Add reply failed:", error);
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
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b, _c;
    const _component_PostCard = vue.resolveComponent("PostCard");
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "new-post" }, [
        vue.createElementVNode("view", { class: "user-avatar-wrapper" }, [
          ((_a = $data.currentUser) == null ? void 0 : _a.avatar) && $data.currentUser.avatar !== "/static/default-avatar.png" ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            class: "user-avatar",
            src: $data.currentUser.avatar,
            mode: "aspectFill"
          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "user-avatar-text"
            },
            vue.toDisplayString(((_c = (_b = $data.currentUser) == null ? void 0 : _b.username) == null ? void 0 : _c.charAt(0).toUpperCase()) || "U"),
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
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/index/index.vue"]]);
  const _sfc_main$2 = {
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
          formatAppLog("log", "at pages/auth/login.vue:57", "Sending login request...");
          const response = await uni.request({
            url: "http://localhost:3000/api/users/login",
            method: "POST",
            data: {
              email: this.email,
              password: this.password
            },
            header: {
              "Content-Type": "application/json"
            }
          });
          formatAppLog("log", "at pages/auth/login.vue:70", "Raw response:", response);
          if (response.statusCode >= 400) {
            throw new Error(response.errMsg || "Network error");
          }
          const responseData = response.data || ((_a = response[1]) == null ? void 0 : _a.data);
          if (!responseData) {
            formatAppLog("error", "at pages/auth/login.vue:80", "Invalid response structure:", response);
            throw new Error("Invalid server response");
          }
          if (responseData.token) {
            uni.setStorageSync("token", responseData.token);
            uni.setStorageSync("user", responseData.user);
            this.currentUser = responseData.user;
            uni.switchTab({
              url: "/pages/index/index"
            });
            uni.showToast({
              title: `Welcome back, ${responseData.user.username}!`,
              icon: "none"
            });
            return;
          }
          throw new Error(responseData.message || "Login failed");
        } catch (error) {
          formatAppLog("error", "at pages/auth/login.vue:105", "Login error details:", error);
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
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createElementVNode("text", { class: "title" }, "Login"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.email = $event),
            class: "input",
            placeholder: "Email",
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
            placeholder: "Password",
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
        vue.createElementVNode("text", {
          class: "register-link",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.goToRegister && $options.goToRegister(...args))
        }, " Don't have an account? Register ")
      ])
    ]);
  }
  const PagesAuthLogin = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-2cc9f8c3"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/auth/login.vue"]]);
  const _sfc_main$1 = {
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
            url: "http://localhost:3000/api/users/register",
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
          formatAppLog("error", "at pages/auth/register.vue:57", "Registration error:", error);
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
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("view", { class: "register-form" }, [
        vue.createElementVNode("text", { class: "title" }, "Register"),
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
        vue.createElementVNode(
          "button",
          {
            class: "register-button",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleRegister && $options.handleRegister(...args))
          },
          vue.toDisplayString($data.loading ? "Registering..." : "Register"),
          1
          /* TEXT */
        ),
        vue.createElementVNode("text", {
          class: "login-link",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.goToLogin && $options.goToLogin(...args))
        }, " Already have an account? Login ")
      ])
    ]);
  }
  const PagesAuthRegister = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-4bb68961"], ["__file", "C:/Users/shwethe/Desktop/Hbuilder/worker_post/pages/auth/register.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/auth/login", PagesAuthLogin);
  __definePage("pages/auth/register", PagesAuthRegister);
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
