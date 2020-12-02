//* TITLE Header Options **//
//* VERSION 3.0.0 **//
//* DESCRIPTION Customize the header. **//
//* DEVELOPER new-xkit **//
//* DETAILS This extension adds your blogs on the top of the page, so you can easily switch between blogs. The blog limit on the header is five, but you can limit this to three blogs and turn off the blog title bubble from the settings. **//
//* FRAME false **//
//* BETA false **//

XKit.extensions.classic_header = new Object({

	running: false,
	slow: true,

	preferences: {
		"sep0": {
			text: "Header Appearance",
			type: "separator",
		},
		"fixed_width": {
			text: "Reduce the max width of the header to match the dashboard",
			default: false,
			value: false,
			desktop_only: true
		},
		"fixed_position": {
			text: "Fixed position header (un-stickify)",
			default: false,
			value: false,
			desktop_only: true
		},
		"fix_color": {
			text: "Make the tab notification bubbles red again",
			default: false,
			value: false,
			desktop_only: true
		},
		"fix_logo": {
			text: "Display the whole \"tumblr\" logo",
			default: false,
			value: false,
			desktop_only: true
		},
		"hide_compose": {
			text: "Hide the compose button",
			default: false,
			value: false,
			desktop_only: true
		},
		"mobile_sticky": {
			text: "Scrolling header (like desktop)",
			default: false,
			value: false,
			mobile_only: true
		},
		"mobile_logout": {
			text: "Add logout button to menu",
			default: false,
			value: false,
			mobile_only: true
		},
		"sep1": {
			text: "Blogs on the header",
			type: "separator",
			desktop_only: true
		},
		"show_avatars": {
			text: "Show my blogs on the header",
			default: true,
			value: true,
			desktop_only: true
		},
		appearance: {
			text: "Avatar Appearance",
			default: "circle",
			value: "circle",
			type: "combo",
			values: [
				"Circle (default)", "circle",
				"Rounded Box", "box",
				"Square", "square"
			],
			desktop_only: true
		},
		maximum: {
			text: "Maximum blogs to show",
			default: "b3",
			value: "b3",
			type: "combo",
			values: [
				"1 Blog", "b1",
				"2 Blogs", "b2",
				"3 Blogs", "b3",
				"4 Blogs", "b4",
				"5 Blogs", "b5"
			],
			desktop_only: true
		},
		"show_bubble": {
			text: "Show blog title bubble on hover",
			default: true,
			value: true,
			desktop_only: true
		}
	},

	run: async function() {
		this.running = true;

		await XKit.css_map.getCssMap();

		XKit.tools.init_css("classic_header");
		$("#xoldeheader").remove();

		if (XKit.extensions.classic_header.preferences.show_avatars.value) {
			XKit.extensions.classic_header.show_blogs();
		}
		if (XKit.extensions.classic_header.preferences.fixed_width.value === true) {
			let containerWidth = $(".l-container:not(.l-container--flex)").css("width");
			let contentSidePad = $(".l-content").css("padding-left");
			let logoLeftPad = $(".png-logo").css("padding-left");

			if (containerWidth && contentSidePad && logoLeftPad) {

				XKit.tools.add_css(`
					.l-header {
						max-width: ${containerWidth} !important;
						padding: 0 ${contentSidePad} !important;
					}
					.logo {
						margin-left: -${logoLeftPad};
					}`,
				"classic_header");

				XKit.installed.when_running("tweaks", function() {
					let mainLeftMargin = $("#left_column").css("margin-left");

					if (mainLeftMargin && mainLeftMargin !== "0px") {
						XKit.tools.add_css(`
							.l-header {
								max-width: calc(${containerWidth} - ${mainLeftMargin}) !important;
								transform: translateX(calc(${mainLeftMargin} / 2));
							}`,
						"classic_header");
					}
				});
			}
		}

		if (XKit.extensions.classic_header.preferences.fix_logo.value) {
			XKit.tools.add_css(`
				.logo .logo-anchor .png-logo {
					background:
						url('https://static.tumblr.com/u5hbev5/Jp3odtljk/tumblr.png')
						50%/145px
						no-repeat;
					width: 145px;
					opacity: 1 !important;
				}
				.logo .logo-anchor .preload-container {
					opacity: 0 !important;
				}`,
			"classic_header");
		}

		if (XKit.extensions.classic_header.preferences.hide_compose.value) {
			XKit.tools.add_css(".compose-button { display: none; }", "classic_header");
		}

		if (XKit.extensions.classic_header.preferences.fixed_position.value) {
			XKit.tools.add_function(function() {
				var Tumblr = window.Tumblr || window.top.Tumblr;
				Tumblr.KeyCommands.scroll_offset = 14;
			}, true);
			XKit.tools.add_css(" .l-header-container { position: absolute !important; box-shadow: none; }" +
								".post_avatar.post-avatar--sticky .post_avatar_wrapper { top: 14px; }" +
								"#xwidgets-drawer, #xwidgets-opener { transform: translate(0,-52px); z-index: 91 !important; }",
								"classic_header");
		}

		if (XKit.extensions.classic_header.preferences.fix_color.value) {
			XKit.tools.add_css(" .tab_notice_value { color: #ffffff !important; }" +
								".selected .tab_notice, .tab_notice { background: #bc3333 !important; }",
								"classic_header");
			$(".tab.iconic.selected").addClass("was-selected").removeClass("selected");
		}

		if (XKit.extensions.classic_header.preferences.mobile_sticky.value) {

			// The nav menu is written terribly. Thanks @staff.
			XKit.tools.add_css(" #container { position: absolute; top:44px; max-width: 800px; width: 100%; } .mobile-nav { position: fixed; top: 0; z-index: 99; left: 0; width: calc(100% + 1px); } .nav-menu .drawer, .nav-menu.active .sneeze-guard { height: calc(100vh - 44px); top:44px; }", "classic_header_mobile_sticky");

			$('#footer').insertAfter($('#load_more_posts'));

			if ($('.mh_post_buttons').length > 0) {
				$('.mh_post_buttons').insertBefore($('#content'));
			}

		}

		if (XKit.extensions.classic_header.preferences.mobile_logout.value) {
			var m_html = '<a class=\"nav-item with-icon\" href=\"/logout\"><span class=\"nav-text nav-item-goodbye\">Log Out</span></a>';
			$('.nav-site-sections').append(m_html);
		}

	},

	show_blogs: function() {

		if (document.location.href.indexOf("/following") !== -1) {
			return;
		}
		var m_html = "";
		var m_counter = 0;
		var max_count = 6;

		if (XKit.extensions.classic_header.preferences.maximum.value !== "") {
			max_count = parseInt(XKit.extensions.classic_header.preferences.maximum.value.substring(1)) + 1;
		}

		if (XKit.extensions.classic_header.preferences.appearance.value === "box") {
			XKit.tools.add_css(".xoldeheader-item { border-radius: 7px !important; }", "classic_header");
		} else if (XKit.extensions.classic_header.preferences.appearance.value === "square") {
			XKit.tools.add_css(".xoldeheader-item { border-radius: 0px !important; }", "classic_header");
		}

		try {
			var tab_blogs = $(".tab_blog");
			if (tab_blogs.length > 0) {
				tab_blogs.each(function(index) {
					var tab_blog = $(this);
					if (tab_blog.hasClass('tab_dashboard')) {
						return;
					}

					m_counter ++;

					if (m_counter >= max_count) {
						return;
					}

					var raw_id = tab_blog.attr('id');
					// Id has the form tab_blog_{blog-name}
					var blog_id = raw_id.substring('tab_blog_'.length, raw_id.length);
					var blog_icon = tab_blog.find('.blog_icon').css('background-image');
					if (!blog_icon || blog_icon === "none") {
						blog_icon = "no-repeat url(\"http://assets.tumblr.com/images/lock_avatar.png\") 50% / 8px";
					}

					var blog_name = tab_blog.find('.blog_name').text();
					var is_private = tab_blog.find('.blog_icon').hasClass('private');

					if (is_private) {
						blog_name += ' [private]';
					}

					m_html = m_html + '<div class="xoldeheader-item-container">' +
						'<a href="http://www.tumblr.com/blog/' + blog_id + '/" class="xoldeheader-item"' +
						' id="xoldeheader-item-' + blog_id + '"' +
						' style=\'background: ' + blog_icon + '\' title="' + blog_name + '">&nbsp;</a>' +
						' <div class="selection_nipple"></div></div>';
				});
				XKit.storage.set("classic_header", "header_html", m_html);
			} else {
				if (XKit.storage.get("classic_header", "header_html", "") === "") {
					return;
				} else {
					m_html = XKit.storage.get("classic_header", "header_html", "");
				}
			}

			let target;
			if (XKit.page.react) {
				target = $(XKit.css_map.keyToCss('menuRight'));
			} else {
				target = $('#user_tools');
			}
			target.prepend('<div id="xoldeheader">' + m_html + '</div>');

			if (XKit.extensions.classic_header.preferences.show_bubble.value === true) {
				$(".xoldeheader-item").tipTip({maxWidth: "auto", delay: 10, edgeOffset: 5 });
			}

			if (document.location.href.indexOf('/blog/') !== -1) {

				var user_url = document.location.href.substring(document.location.href.indexOf('/blog/') + 6);
				user_url = user_url.replace("#", "");
				if (user_url.indexOf("/") !== -1) {
					user_url = user_url.substring(0, user_url.indexOf("/"));
				}

				$("#xoldeheader-item-" + user_url).addClass("selected");
				$("#xoldeheader-item-" + user_url).parent().addClass("selected");
				$("#home_button").removeClass("selected");

			}

		} catch (e) {
			console.error(e.message);
		}

	},

	destroy: function() {
		this.running = false;
		XKit.tools.add_function(function() {
			var Tumblr = window.Tumblr || window.top.Tumblr;
			Tumblr.KeyCommands.scroll_offset = 69;
		}, true);
		XKit.tools.remove_css("classic_header");
		XKit.tools.remove_css("classic_header_mobile_sticky");
		$(".nav-item-goodbye").remove();
		$("#xoldeheader").remove();
		$(".tab.iconic.was-selected").addClass("selected").removeClass("was-selected");
	}

});
