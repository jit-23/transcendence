import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import React from "react";

export const changeLanguage = (): void => {
	const order = ["en", "es", "pt"] as const;
	const current = i18n.language.split("-")[0];

	const currentIndex = order.indexOf(current as typeof order[number]);
	const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;

	i18n.changeLanguage(order[nextIndex]);
};

i18n.use(I18nextBrowserLanguageDetector).use(initReactI18next).init({
	debug: true,
	lng: "en",
	resources: {
		en: {
			translation: {
				//utils
				cancel_button: "Cancel",
				delete_button: "Delete",
				refresh_button: "Refresh",
				loading_button: "Loading...",
				dashboard_button: "Dashboard",

				//Home
				HO_slogan_1: "Think together,",
				HO_slogan_2: "in real time.",
				HO_description_1: "A shared canvas for your team - draw, plan,",
				HO_description_2: "and collaborate without the noise.",
				HO_sign_up: "Get started →",
				HO_log_in: "Log in",

				//userSignup
				SU_create_account: "Create your workspace account",
				SU_username: "Username",
				SU_your_name: "Your name",
				SU_your_email: "you@example.com",
				SU_password: "Password",
				SU_your_password: "at least 6 characters",
				SU_next: "Next",
				SU_choose_avatar: "Choose your avatar",
				SU_how_others_see_you: "This is how other will see you.",
				SU_default_avatars: "Default avatars",
				SU_upload_your_own: "Upload your own",
				SU_choose_image: "Choose image",
				SU_image_loaded: "✓ Imaged loaded",
				SU_creating_account: "Creating account...",
				SU_create_accout_confirm: "Create account →",
				SU_back: "← Back",
				SU_already_have_account: "Already have an account?",

				//userLogin
				LI_sign_in_workspace: "Sign in to your workspace",
				LI_signing_in: "Signing in...",
				LI_sign_in_confirm: "Sign in →",
				LI_open_auth_app: "Open your authenticator app and enter the 6-digit code.",
				LI_auth_code: "Authentication Code",
				LI_verifying: "Verifying...",
				LI_verify: "Verify →",
				LI_back_to_login: "← Back to login",
				LI_dont_have_acc: "Don't have an account?",
				LI_create_one: "Create one",

				//dashboard
				DB_profile: "Profile",
				DB_add_friend: "Add friend",
				DB_friend_req: "Friend Requests",
				DB_no_pend_req: "No pending requests.",
				DB_refresh_req: "Refresh",
				DB_accept_req: "Accept",
				DB_reject_req: "Reject",
				DB_sign_out: "Sign out",
				DB_welcome_back: "Welcome back, ",
				DB_manage_acc_sec: "Manage your account and security settings.",
				DB_talk_to_friends: "Talk to friends",
				DB_open_dashboard: "Open",
				DB_plan_projects: "Plan Your Projects",

				//TwoFactorCard
				TFC_two_fac_auth: "Two-Factor Authentication",
				TFC_protect_acc_2fa: "Protect your account with a time-based one-time password from an authenticator app.",
				TFC_enabled_2fa: "Enabled",
				TFC_disabled_2fa: "Disabled",
				TFC_loading_2fa: "Loading...",
				TFC_enable_2fa: "Enable 2FA",
				TFC_scan_2fa: "Scan this with Google Authenticator or Authy.",
				TFC_wont_see_2fa: "You won't see it again.",
				TFC_enter_2fa: "Enter the 6-digit code from your app to confirm:",
				TFC_confirm_2fa: "Confirm",
				TFC_acc_protected_2fa: "Your account is protected. An authenticator code is required at every login.",
				TFC_disable_2fa: "Disable 2FA",
				TFC_enter_curr_2fa: "Enter your current authenticator code to confirm:",
				TFC_disabling_2fa: "Disabling...",
				TFC_cancel_2fa: "Cancel",

				//FriendsCard
				FRC_my_friends: "My Friends",
				FRC_no_friends: "You do not have friends yet.",
				FRC_loading: "Loading...",
				FRC_refresh: "Refresh",
				FRC_profile: "Profile",
				FRC_chat: "Chat",
				FRC_remove: "Removing...",
				FRC_unfriend: "Unfriend",

				//Canvases
				CVS_plan_group_proj: "Plan Your Group Projects",
				CVS_create_canvas_proj: "Create canvases for project planning and collaboration.",
				CVS_your_canvases: "Your Canvases ",
				CVS_loading_canvases: "Loading...",
				CVS_max_3_canvases: "Max 3 Canvases",
				CVS_add_canvas: "Add Canvas",
				CVS_canvas_name_opt: "Canvas name (optional)",
				CVS_creating_canvas: "Creating...",
				CVS_create_canvas: "Create",
				CVS_cancel_canvas: "Cancel",
				CVS_delete_canvas: "Delete",
				CVS_no_canvas: "No canvases yet. Create one to get started!",
				CVS_chat_rooms: "Chat Rooms",
				CVS_use_canvas: "Use canvases to sketch, plan, and organize group work.",//seems like this text is wrong
				CVS_chat_room: "Chat Room",

				//Canvas
				CV_apply: "Apply",
				CV_canvas: "Canvas",
				CV_clear: "Clear",
				CV_background: "Background",
				CV_line_color: "Line Color",
				CV_tool: "Tool",
				CV_CV_cursor: "Cursor",
				CV_freehand: "Free Hand",
				CV_eraser: "Eraser",
				CV_line: "Line",
				CV_arrow: "Arrow",
				CV_rect: "Rectangle",
				CV_rounded_rect: "Rounded Rectangle",
				CV_circle: "Circles",
				CV_text: "Text",
				CV_textbox: "Text Box",
				CV_rounded_textbox: "Rounded Text Box",
				CV_fill_shape: "Fill Shape",
				CV_text_font: "Text Font",
				CV_stroke_weight: "Stroke Weight",
				CV_zoom: "Zoom",

				//Profile
				PF_dashboard: "← Dashboard",
				PF_edit_profile: "Edit Profile",
				PF_update: "Update your account information and avatar.",
				PF_account_details: "Account Details",
				PF_username_: "Username",
				PF_new_pass: "New Password",
				PF_leave_blank: "Leave blank to keep current",
				PF_confirm_new_pass: "Confirm New Password",
				PF_repeat_new: "Repeat new password",
				PF_curr_pass: "Current Password",
				PF_req_save: "Required to save any changes",
				PF_saving_change: "Saving...",
				PF_save_change: "Save Changes",
				PF_save_avatar: "Save Avatar",
				PF_cancel: "Cancel",
				PF_preview_avatar: "Preview",
				PF_others_see_avatar: "This is how others will see you",

				//App
				page_doesnt_exist: "This page doesn't exist.",
				go_home: "Go home",

				//chat
				CH_direct_chat: "Direct Chat",
				CH_open_chat: "Open this page from your friends list.",
				CH_talking_to_chat: "Talking to:",
				CH_select_username_chat: "Select a username to start chatting",
				CH_no_messages_chat: "No messages yet.",
				CH_friend_username_chat: "Friend username",
				CH_type_message_chat: "Type a message",
				CH_send_chat: "Send",
				CH_is_typing_chat: "is typing...",

				//conversations
				CO_dashboard: "Dashboard",
				CO_choose: "Choose Conversation Type",
				CO_pick_how: "Pick how you want to chat.",
				CO_one_to_one: "1 to 1 Conversation",
				CO_group_chat: "Group Chats",

				//groupChats
				GCS_group_chats: "Group Chats",
				GCS_create_groups: "Create groups and chat with multiple friends.",
				GCS_create_group: "Create Group",
				GCS_you_need_friends: "You need friends to create a group",
				GCS_creating: "Creating...",
				GCS_create: "Create Group",
				GCS_refresh: "Refresh",
				GCS_no_groups: "No groups yet.",
				GCS_members: "members",
				GCS_open_chat: "Open Chat",
				
				//searchFriends
				FRS_dashboard: "Dashboard",
				FRS_profile: "Profile",
				FRS_search: "Search for Friends",
				FRS_find: "Find users by username or email",
				FRS_search_user: "Search by username or email...",
				FRS_searching: "Searching...",
				FRS_search_button: "Search",
				FRS_no_results: "No results found",
				FRS_no_user_match: "No users match your search",
				FRS_results: "Results",
				FRS_requested: "✓ Requested",
				FRS_add: "+ Add",

				//OTHERS...... to translate....................
				SU_8chars: "8+ characters",
				SU_1up: "1 uppercase letter",
				SU_1low: "1 lowercase letter",
				SU_1num: "1 number",
				SU_1sym: "1 symbol",
				SU_user_req: "Username is required",
				SU_user_cannot: "Username cannot contain spaces",
				SU_email_req: "Email is required",
				SU_avatar_only: "Only JPG, PNG or WebP allowed",
				SU_under2mb: "Image must be under 2MB",
				SU_signup_failed: "Signup failed",
				SU_network_error: "Network error. Please try again",
				SU_fast_setup: "Fast setup with email or OAuth sign-up.",
				SU_spaces_not: "Spaces aren’t allowed in usernames.",
				SU_pass_place: "8+ chars, upper, lower, number, symbol",
				SU_hide_pass: "Hide password",
				SU_show_pass: "Show password",
				SU_hide: "Hide",
				SU_show: "Show",
				SU_pass_check: "Password checklist",
				SU_or: "or",
				SU_redir_google: "Redirecting to Google...",
				SU_sign_google: "Sign up with Google",
				SU_redir_42: "Redirecting to 42...",
				SU_sign_42: "Sign up with 42",
				SU_OAuth: "OAuth opens a secure provider page and returns you automatically.",
				SU_signin: "Sign in",

				LI_sess_exp: "Login session expired. Please try signing in again.",
				LI_signin_fail: "OAuth sign-in failed. Please try again.",
				LI_oauth_unav: "OAuth is currently unavailable. Please try email/password or contact support.",
				LI_login_fail: "Login failed",
				LI_network_fail_try: "Network error. Please try again.",
				LI_enter_6: "Enter your 6-digit code",
				LI_inv_code: "Invalid code",
				LI_network_fail: "Network error",
				LI_init_oauth1: "Initiating ",
				LI_two_auth: "Two-factor verification",
				LI_secure: "Secure access to your collaborative dashboard.",
				LI_or: "or",
				LI_continue_google: "Continue with Google",
				LI_continue_42: "Continue with 42",
				LI_oauth_opens: "OAuth opens a secure provider page and returns you automatically.",
				LI_tip_code: "Tip: you can paste the full 6-digit code.",
				
				NF_doesnt_exist: "This page doesn't exist.",
				NF_dash: "← Go to dashboard",
				FT_priv: "Privacy Policy",
				FT_terms: "Terms of Service",

				DB_desc: "Quick actions, social updates, and account security in one place.",
				DB_quick: "Quick actions",
				DB_start: "Start by adding a friend or jump into your active spaces.",
				DB_open_convo: "Open conversations",
				DB_open_canvas: "Open canvases",
				DB_blocked: "Blocked users",
				DB_security: "Security",
				DB_social: "Social",
				DB_close: "Close",
				DB_search: "Search by username or email",
				DB_load_pend: "Loading pending requests...",
				DB_invite: "Invite someone by username or email. They’ll receive a friend request.",
				DB_no_users: "No users found.",
				DB_request: "Requested",
				DB_invitebutton: "Invite",


				TFC_verifying: "Verifying...",
				TFC_confirm: "Confirm",
				TFC_tip: "Tip: paste is supported for the full code.",
				TFC_disable: "Disable verification",
				TFC_step1: "Step 1 — Start setup",
				TFC_step2: "Step 2 — Scan and verify",

				PF_settings: "Profile Settings",
				PF_manage: "Manage your account details, avatar, and security preferences.",
				PF_quick: "Quick actions",
				PF_avatar: "Change avatar",
				PF_blocked: "Blocked users",
				PF_dash: "Dashboard",
				PF_curr_avatar: "Current avatar",
				PF_account: "Account Details",
				PF_identity: "Identity",
				PF_username: "Username",
				PF_pass_rules: "Password rules:",
				PF_pass_mismatch: "Passwords do not match.",
				PF_verification: "Verification",
				PF_pass_req: "required",
				PF_make: "Make a change to enable saving.",
				PF_curr_pass_save: "Enter your current password to save changes.",

				CVS_failed_load_cvs: "Failed to load canvases",
				CVS_network_fail_load_cvs: "Network error while loading friends",
				CVS_failed_load_friends: "Failed to load canvases",
				CVS_network_fail_load_friends: "Network error while loading friends",
				CVS_failed_create: "Failed to create canvas",
				CVS_network_fail_create: "Network error while delete canvas",
				CVS_failed_delete: "Failed to create canvas",
				CVS_network_fail_delete: "Network error while deleting canvas",
				CVS_failed_invite: "Failed to invite friend",
				CVS_network_fail_invite: "Network error while invite friend",
				CVS_close_invite: "Close Invite",
				CVS_invite: "Invite",
				CVS_no_friends: "No friends available to invite.",
				CVS_inviting: "Inviting...",

				CV_save: "Saving...",

				GCS_my_groups: "My groups",
				GCS_delete: "Delete",
				GCS_leave: "Leave",

				BLU_prof: "← Profile",
				BLU_dash: "Dashboard",
				BLU_blocked: "Blocked Users",
				BLU_manage: "Manage users you have blocked.",
				BLU_list: "Blocked list",
				BLU_refreshing: "Refreshing...",
				BLU_refresh: "Refresh",
				BLU_loading: "Loading blocked users...",
				BLU_no_blocked: "You have no blocked users.",
				BLU_when: "When you block someone, they will appear here.",
				BLU_view: "View profile",
				BLU_unblocking: "Unblocking...",
				BLU_unblock: "Unblock",

				UPF_back: "← Back",
				UPF_dash: "Dashboard",
				UPF_prof: "User Profile",
				UPF_view: "View profile information",
				UPF_public: "Public details",
				UPF_loading: "Loading profile...",
				UPF_joined: "Joined",
				UPF_blocked: "You are blocked by this user.",
				UPF_unblocking: "Unblocking...",
				UPF_unblock: "Unblocked",
				UPF_message: "Message",
				UPF_removing: "Removing...",
				UPF_remove: "Remove friend",
				UPF_block: "Block",
				UPF_request: "✓ Requested",
				UPF_sending: "Sending...",
				UPF_add: "Add friend",
				UPF_block2: "Block",



				//PRIVACY
				privacy_priv: "Privacy Policy",
				privacy_last: "Last Updated: April 13, 2026",
				privacy_back: "← Back to home",
				privacy_details: "Policy details",
				privacy_1: "1. Introduction\n\
					This Privacy Policy explains how Transcendence (\"we,\" \"us,\" \"our,\" or \"Company\") \
					collects, uses, discloses, and otherwise processes personal information in connection \
					with our website, mobile applications, and services (collectively, the \"Services\"). \
					Please read this Privacy Policy carefully. If you do not agree with our policies and practices, \
					please do not use our Services.\n\n",
				privacy_2: "2. Information We Collect\n\
					2.1 Information You Provide Directly\n\
					We may collect account information such as your name, email address, password, and profile information when you register; authentication information if you use OAuth 2.0 authentication through Google or 42 School; communication data such as messages, conversations, and chat content; canvas data such as content, drawings, and collaborative information related to our canvas features; and user preferences such as your account settings, theme preferences, and notification preferences.\n\
					2.2 Information Collected Automatically\n\
					We may collect device information such as device type, operating system, and browser type; usage data such as pages visited, features used, actions taken, and time spent on the Services; IP address and approximate geographic location; and cookies and similar tracking technologies used to track user activity and preferences.\n\
					2.3 Third-Party Information\n\
					We may receive information from OAuth providers such as Google and 42 School, as well as information other users provide about you when using our Services, such as friend requests or mentions in conversations.\n\n",
				privacy_3: "3. How We Use Your Information\n\
					We use the information we collect to provide, maintain, and improve the Services; create and manage your account; send service-related announcements and respond to your inquiries; customize your experience and deliver personalized content; understand how users interact with our Services and improve functionality; detect, prevent, and address fraud and security issues; comply with applicable laws and regulations; and monitor system performance and user activity through Prometheus metrics.\n\n",
				privacy_4: "4. How We Share Your Information\n\
					4.1 Information Sharing\n\
					We may share your information with canvas collaborators and friends who can see your profile information and shared content; with service providers who assist us in operating the Services and conducting our business; when required by law or in response to legal process; if we merge with or are acquired by another company; with limited information to enforce user blocking features; and with other users for information you choose to make public.\n\
					4.2 Information We Do Not Share\n\
					We do not sell or rent your personal information to third parties. We do not share passwords or authentication credentials. We do not share private messages without your consent unless required by law.\n\n",
				privacy_5: "5. Data Security\n\
					We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.\n\n",
				privacy_6: "6. Data Retention\n\
					We retain your personal information for as long as your account is active or as necessary to provide the Services. When you delete your account, we will delete or anonymize your information within 30 days, except where we are required to retain it by law or for legitimate business purposes.\n\n",
				privacy_7: "7. Two-Factor Authentication\n\
					We offer two-factor authentication (2FA) to enhance account security. Enabling 2FA adds an additional layer of protection to your account using time-based one-time passwords (TOTP).\n\n",
				privacy_8: "8. User Control and Rights\n\
					You have the right to access and review your personal information through your account settings, update or correct inaccurate information, request deletion of your account and associated data, request a copy of your data in a portable format, and withdraw consent for specific processing activities. To exercise these rights, please contact us using the information in Section 10.\n\n",
				privacy_9: "9. Children&apos;s Privacy\n\
					Our Services are not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.\n\n",
				privacy_10: "10. Contact Us\n\
					If you have questions about this Privacy Policy or our privacy practices, please contact us at: Email: privacy@transcendence.local. Address: Transcendence Services, 42 School, Paris, France.\n\n",
				privacy_11: "11. Changes to This Privacy Policy\n\
					We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy and changing the \"Last Updated\" date. Your continued use of the Services following the posting of changes constitutes your acceptance of those changes.\n\n",
				privacy_12: "End of Privacy Policy",

				
				//TERMS
				terms_terms: "Terms of Service",
				terms_last: "Last Updated: April 13, 2026",
				terms_back: "← Back to home",
				terms_serv: "Service terms",
				terms_1: "1. Acceptance of Terms\n\
					By accessing and using Transcendence (\"Service,\" \"we,\" \"us,\" \"our,\" or \"Company\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. We reserve the right to modify these terms at any time, and your continued use of the Service following modifications constitutes your acceptance of the modified terms.\n\n",
				terms_2: "2. Use License\n\
					2.1 Grant of License\n\
					We grant you a limited, non-exclusive, revocable license to access and use the Service for lawful purposes only, subject to your compliance with these Terms of Service.\n\
					2.2 Restrictions\n\
					You agree not to reproduce, distribute, or transmit any content without proper authorization. You agree not to modify, adapt, translate, or create derivative works based on the Service. You agree not to reverse engineer, decompile, or attempt to discover the source code or underlying technology. You agree not to use the Service for any illegal or unauthorized purpose. You agree not to introduce viruses, malware, or other malicious code. You agree not to attempt to gain unauthorized access to the Service or its systems. You agree not to harass, abuse, defame, or threaten other users. You agree not to spam or send unsolicited messages. You agree not to use automated tools (bots, scrapers) without authorization. You agree not to circumvent security measures or access restrictions.\n\n",
				terms_3: "3. User Accounts\n\
					3.1 Account Registration\n\
					To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your password and account information. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.\n\
					3.2 Account Security\n\
					You are responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.\n\
					3.3 Account Termination\n\
					We reserve the right to suspend or terminate your account if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.\n\n",
				terms_4: "4. Authentication\n\
					4.1 OAuth 2.0\n\
					The Service supports authentication through Google OAuth 2.0 and 42 School OAuth 2.0. When you use OAuth authentication, you are granting us permission to access the information from those services as indicated by the authorization prompts.\n\
					4.2 Two-Factor Authentication\n\
					We strongly recommend enabling two-factor authentication (2FA) for enhanced security. You are responsible for managing and protecting your 2FA credentials (TOTP codes).\n\n",
				terms_5: "5. User Content\n\
					5.1 Content Ownership\n\
					You retain all rights to content you create and upload to the Service (\"Your Content\"). By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display Your Content for the purpose of operating and improving the Service.\n\
					5.2 Content Standards\n\
					Your Content must not violate any applicable law or regulation, infringe upon intellectual property rights of third parties, contain defamatory, obscene, offensive, or harmful material, constitute spam or unsolicited promotion, or contain personal information of others without consent.\n\
					5.3 Moderation\n\
					We reserve the right to remove, edit, or refuse to publish any content that violates these Terms of Service or applicable laws.\n\n",
				terms_6: "6. Canvas and Collaborative Features\n\
					6.1 Canvas Sharing\n\
					When you share a canvas with other users, those users gain access rights as specified by you. You are responsible for managing canvas permissions.\n\
					6.2 Collaborative Responsibility\n\
					Users who collaborate on a canvas agree to respect intellectual property rights and not use the collaborative features for harassment or abuse.\n\
					6.3 Canvas Data\n\
					Canvases and associated data may be stored on our servers. While we implement security measures, we are not liable for data loss or unauthorized access.\n\n",
				terms_7: "7. Communications and Chat\n\
					7.1 Privacy of Messages\n\
					Private messages between users are intended to be private. However, we may access messages for security, legal, or abuse prevention purposes.\n\
					7.2 Conversation Records\n\
					Conversations may be temporarily stored on our servers for service delivery purposes. You may delete your conversations at any time.\n\
					7.3 Blocking and Reporting\n\
					You can block other users to prevent them from contacting you. If you experience harassment or abuse, you can report users to our moderation team.\n\n",
				terms_8: "8. Limitation of Liability\n\
					8.1 No Consequential Damages\n\
					To the fullest extent permitted by law, we shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or business opportunity.\n\
					8.2 Liability Cap\n\
					Our total liability to you for all claims arising from these Terms of Service shall not exceed $100 or the amounts you have paid to us in the 12 months preceding the claim, whichever is greater.\n\n",
				terms_9: "9. User Conduct\n\
					You agree to use the Service only for lawful purposes and in ways that do not infringe upon the rights of others. Prohibited behavior includes harassing or threatening other users, attempting unauthorized access, collecting personal information without consent, and violating applicable laws.\n\n",
				terms_10: "10. Dispute Resolution\n\
					10.1 Governing Law\n\
					These Terms of Service are governed by and construed in accordance with the laws of France, without regard to its conflict of law principles.\n\
					10.2 Informal Resolution\n\
					Before pursuing formal dispute resolution, you agree to attempt to resolve disputes informally by contacting us.\n\n",
				terms_11: "11. Termination\n\
					11.1 Termination by You\n\
					You may terminate your account at any time by contacting us or using account settings.\n\
					11.2 Termination by Us\n\
					We may suspend or terminate your access to the Service immediately if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.\n\n",
				terms_12: "12. Contact Information\n\
					For questions about these Terms of Service, please contact us at: Email: legal@transcendence.local. Address: Transcendence Services, 42 School, Paris, France.\n\n",
				terms_13: "13. Entire Agreement\n\
					These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.\n\n",
				terms_14: "BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.`;\n\n",





				},
		},
		pt: {
			// translation: {
			// 	//WORKSPACE, CANVAS, caractersm 2FA
			// 	//utils
			// 	cancel_button: "Cancelar",
			// 	delete_button: "Eliminar",
			// 	refresh_button: "Atualizar",
			// 	loading_button: "A carregar...",
			// 	dashboard_button: "Painel de controlo",

			// 	//Home
			// 	slogan_1: "Pensa em conjunto,",
			// 	slogan_2: "em tempo real.",
			// 	description_1: "Um canvas partilhado pela tua equipa:",//bad: canvas
			// 	description_2: "desenha, planeia e colabora sem incómodo.",
			// 	sign_up: "Começar",
			// 	log_in: "Iniciar sessão",

			// 	//userSignup
			// 	create_account: "Criar conta de workspace",//bad: workspace
			// 	username: "Nome de utilizador",
			// 	your_name: "o teu utilizador",
			// 	your_email: "oteunome@exemplo.com",
			// 	password: "palavra-passe",
			// 	your_password: "pelo menos 6 caractéres",//bad: caracteres
			// 	next: "Seguinte",
			// 	choose_avatar: "Escolher foto de perfil",
			// 	how_others_see_you: "Isto é como outros te vão ver",
			// 	default_avatars: "Fotos de perfil pré-definidas",
			// 	upload_your_own: "Carrega uma imagem tua",
			// 	choose_image: "Escolher imagem",
			// 	image_loaded: "Imagem carregada",
			// 	image_loaded_avatar: "✓ Imagem carregada — Carrega guardar",
			// 	creating_account: "A criar conta...",
			// 	create_accout_confirm: "Criar conta →",
			// 	back: "← Atrás",
			// 	already_have_account: "Já tens conta?",
			
			// 	//userLogin
			// 	sign_in_workspace: "Inicia sessão no teu workspace",//bad: workspace
			// 	signing_in: "A iniciar sessão...",
			// 	sign_in_confirm: "Iniciar sessão →",
			// 	open_auth_app: "Abre a tua aplicação de autenticação e insere o cõdigo de 6 dígitos.",
			// 	auth_code: "Código de autenticação",
			// 	verifying: "A verificar...",
			// 	verify: "Verificar →",
			// 	back_to_login: "← De volta ao início de sessão",
			// 	dont_have_acc: "Não tens conta?",
			// 	create_one: "Cria uma",

			// 	//dashboard
			// 	profile: "Perfil",
			// 	add_friend: "Adicionar amigo",
			// 	friend_req: "Pedidos de amizade",
			// 	no_pend_req: "Nenhum pedido de amizade.",
			// 	refresh_req: "Atualizar",
			// 	accept_req: "Aceitar",
			// 	reject_req: "Rejeitar",
			// 	sign_out: "Terminar sessão",
			// 	welcome_back: "Bem vindo de volta, ",
			// 	manage_acc_sec:  "Opções de conta e de seguranca",
			// 	talk_to_friends: "Falar com amigos",
			// 	open_dashboard: "Abrir",
			// 	plan_projects: "Planeia os teus projetos",

			// 	//TwoFactorCard
			// 	two_fac_auth: "Autenticação de dois fatores",
			// 	protect_acc_2fa: "Protege a tua conta com um código de utilização única a partir de uma aplicação de autenticação",
			// 	enabled_2fa: "Ligada",
			// 	disabled_2fa: "Desligada",
			// 	loading_2fa: "A carregar...",
			// 	enable_2fa: "Ativar 2FA",
			// 	scan_2fa: "Lê o código com Google Authenticator ou Authy", 
			// 	wont_see_2fa: "Não irás ver este código de novo",
			// 	enter_2fa: "Escreve o código de 6 dígitos da tua aplicação para confirmar", 
			// 	confirm_2fa: "Confirmar",
			// 	acc_protected_2fa: "A tua conta esta protegida. Um código de autenticação e necessário para todas as sessões", 
			// 	disable_2fa: "Desativar 2FA",
			// 	enter_curr_2fa: "Escreve o código de autenticação atual",
			// 	disabling_2fa: "A desativar...",
			// 	cancel_2fa: "Cancelar",

			// 	//FriendsCard
			// 	my_friends: "Amigos",
			// 	loading_friends: "A carregar...",
			// 	refresh_friends: "Atualizar",
			// 	no_friends: "Ainda não tens amigos.",
			// 	chat_friends: "Conversas",
			// 	removing_friends: "A remover...",
			// 	unfriend: "Remover amigo",

			// 	//Canvases
			// 	plan_group_proj: "Planeia os teus projetos",
			// 	create_canvas_proj: "Cria canvas para planeamento de projeto e colaboração",//bad: canvas
			// 	your_canvases: "Os teus canvas",//bad: canvas
			// 	loading_canvases: "A carregar...",
			// 	max_3_canvases: "Máximo: 3 canvas",//bad: canvas
			// 	add_canvas: "Adicionar canvas",//bad: canvas
			// 	canvas_name_opt: "Nome do canvas (opcional)",//bad: canvas
			// 	creating_canvas: "A criar...",
			// 	create_canvas: "Criar",
			// 	cancel_canvas: "Cancelar",
			// 	delete_canvas: "Eliminar",
			// 	no_canvas: "Não tens canvas. Cria um para começar!",
			// 	chat_rooms: "Salas de conversa",
			// 	use_canvas: "Usa o canvas para desenhar, planear e organizar trabalho de grupo",
			// 	chat_room: "Salas de conversa",

			// 	//Canvas
			// 	apply_canvas: "Aplicar",
			// 	canvas_canvas: "Canvas",//bad, canvas
			// 	clear_canvas: "Eliminar",
			// 	background_canvas: "Background",//bad: background
			// 	line_color_canvas: "Cor de linha",
			// 	tool_canvas: "Ferramenta",
			// 	cursor_canvas: "Cursor",
			// 	freehand_canvas: "Mão livre",
			// 	eraser_canvas: "Borracha",
			// 	line_canvas: "Linha",
			// 	arrow_canvas: "Seta",
			// 	rect_canvas: "Retângulo",
			// 	rounded_rect_canvas: "Retângulo arredondado",
			// 	circle_canvas: "Circulo",
			// 	text_canvas: "Texto",
			// 	textbox_canvas: "Caixa de texto",
			// 	rounded_textbox_canvas: "Caixa de texto arredondada",
			// 	fill_shape_canvas: "Preencher forma",
			// 	text_font_canvas: "Fonte de texto",
			// 	stroke_weight_canvas: "Peso de escrita",//bad translate
			// 	zoom_canvas: "Zoom",

			// 	//Profile
			// 	dashboard_prof: "← Dashboard",//bad, dashboard
			// 	edit_profile: "Editar perfil",
			// 	update_prof: "Atualizar a informação da conta e foto de perfil.",
			// 	account_details: "Detalhes da conta",
			// 	username_prof: "Nome de utilizador",
			// 	new_pass_prof: "Nova palavra-passe",
			// 	leave_blank_prof: "Deixa em branco para manter a mesma",
			// 	confirm_new_pass_prof: "Confirmar palavra-passe novaZ",
			// 	repeat_new_prof: "Repete a nova palavra-passe",
			// 	curr_pass_prof: "Palavra-passe atual",
			// 	req_save_prof: "Necessário para aplicar mudanças",
			// 	saving_change_prof: "A guardar...",
			// 	save_change_prof: "Guardar alterações",
			// 	save_avatar: "Guardar foto de perfil",
			// 	cancel_prof: "Cancelar",
			// 	preview_avatar: "Pre-visualizar",
			// 	others_see_avatar: "Isto é como os outros vão ver-te",

			// 	//App
			// 	page_doesnt_exist: "Esta página não existe.",
			// 	go_home: "Ir para a página principal",

			// 	//chat
			// 	direct_chat: "Conversas privadas",
			// 	open_chat: "Abrir",
			// 	talking_to_chat: "A falar com:",
			// 	select_username_chat: "Seleciona um utilizador para conversar",
			// 	no_messages_chat: "Sem mensagens",
			// 	friend_username_chat: "Nome de amigo",
			// 	type_message_chat: "Escreve uma mensagem",
			// 	send_chat: "Enviar",
			// 	is_typing_chat: "está a escrever...",

			// 	//conversations
			// 	dashboard_convo: "Dashboard",//bad, dashboard
			// 	choose_convo: "Escolher tipo de conversa",
			// 	pick_how_convo: "Escolhe como queres conversar.",
			// 	one_to_one_convo: "Conversa 1 para 1",
			// 	group_chat_convo: "Conversa de grupo",

			// 	//groupChats
			// 	group_chats_gcs: "Conversas de grupo",
			// 	create_groups_gcs: "Cria grupos e conversa com múltiplos amigos",
			// 	create_group_gcs: "Cria um grupo",
			// 	you_need_friends_gcs: "Precisas de amigos para criar um grupo",
			// 	creating_gcs: "A criar...",
			// 	create_button_gcs: "Criar grupo",
			// 	refresh_gcs: "Atualizar",
			// 	no_groups_gcs: "Sem grupos.",
			// 	members_gcs: "membros",
			// 	open_chat_gcs: "Abrir conversa",
				
			// 	//searchFriends
			// 	dashboard_friends: "Dashboard",//bad, dashboard
			// 	profile_friends: "Perfil",
			// 	search_friends: "Pesquisar por amigos",
			// 	find_friends: "Pesquisar utilizadores por nome ou email",
			// 	search_user: "Procurar por nome ou email...",
			// 	searching_friends: "A procurar...",
			// 	search_button: "Procurar",
			// 	no_results_friends: "Nenhum resultado",
			// 	no_user_match_friends: "Nenhum utilizador coincide com a pesquisa",
			// 	results_friends: "Resultados",
			// 	requested_friends: "✓ Pedido",
			// 	add_friends: "+ Adicionar"
			// },
		},
		es: {
			// translation: {
			// 	//utils
			// 	cancel_button: "Cancelar",
			// 	delete_button: "Eliminar",
			// 	refresh_button: "Actualizar",
			// 	loading_button: "Cargando...",
			// 	dashboard_button: "Panel",

			// 	//Home
			// 	slogan_1: "Piensa juntos,",
			// 	slogan_2: "en tiempo real.",
			// 	description_1: "Un lienzo compartido para tu equipo - dibuja, planifica,",
			// 	description_2: "y colabora sin ruido.",
			// 	sign_up: "Comenzar",
			// 	log_in: "Iniciar sesión",

			// 	//userSignup
			// 	create_account: "Crea tu cuenta de espacio de trabajo",
			// 	username: "Nombre de usuario",
			// 	your_name: "Tu nombre",
			// 	your_email: "tu@ejemplo.com",
			// 	password: "Contraseña",
			// 	your_password: "al menos 6 caracteres",
			// 	next: "Siguiente",
			// 	choose_avatar: "Elige tu avatar",
			// 	how_others_see_you: "Así es como otros te verán.",
			// 	default_avatars: "Avatares predeterminados",
			// 	upload_your_own: "Sube el tuyo",
			// 	choose_image: "Elegir imagen",
			// 	image_loaded: "Imagen cargada",
			// 	creating_account: "Creando cuenta...",
			// 	create_accout_confirm: "Crear cuenta →",
			// 	back: "← Atrás",
			// 	already_have_account: "¿Ya tienes una cuenta?",
			
			// 	//userLogin
			// 	sign_in_workspace: "Inicia sesión en tu espacio de trabajo",
			// 	signing_in: "Iniciando sesión...",
			// 	sign_in_confirm: "Iniciar sesión →",
			// 	open_auth_app: "Abre tu aplicación de autenticación e introduce el código de 6 dígitos.",
			// 	auth_code: "Código de autenticación",
			// 	verifying: "Verificando...",
			// 	verify: "Verificar →",
			// 	back_to_login: "← Volver al inicio de sesión",
			// 	dont_have_acc: "¿No tienes una cuenta?",
			// 	create_one: "Crea una",

			// 	//dashboard
			// 	profile: "Perfil",
			// 	add_friend: "Añadir amigo",
			// 	friend_req: "Solicitudes de amistad",
			// 	no_pend_req: "No hay solicitudes pendientes.",
			// 	refresh_req: "Actualizar",
			// 	accept_req: "Aceptar",
			// 	reject_req: "Rechazar",
			// 	sign_out: "Cerrar sesión",
			// 	welcome_back: "Bienvenido de nuevo, ",
			// 	manage_acc_sec: "Gestiona tu cuenta y la configuración de seguridad.",
			// 	talk_to_friends: "Habla con amigos",
			// 	open_dashboard: "Abrir",
			// 	plan_projects: "Planifica tus proyectos",

			// 	//TwoFactorCard
			// 	two_fac_auth: "Autenticación de dos factores",
			// 	protect_acc_2fa: "Protege tu cuenta con una contraseña de un solo uso basada en el tiempo desde una app de autenticación.",
			// 	enabled_2fa: "Activado",
			// 	disabled_2fa: "Desactivado",
			// 	loading_2fa: "Cargando...",
			// 	enable_2fa: "Activar 2FA",
			// 	scan_2fa: "Escanea esto con Google Authenticator o Authy.",
			// 	wont_see_2fa: "No lo volverás a ver.",
			// 	enter_2fa: "Introduce el código de 6 dígitos de tu app para confirmar:",
			// 	confirm_2fa: "Confirmar",
			// 	acc_protected_2fa: "Tu cuenta está protegida. Se requiere un código de autenticación en cada inicio de sesión.",
			// 	disable_2fa: "Desactivar 2FA",
			// 	enter_curr_2fa: "Introduce tu código actual de autenticación para confirmar:",
			// 	disabling_2fa: "Desactivando...",
			// 	cancel_2fa: "Cancelar",


			// 	//FriendsCard
			// 	my_friends: "Mis amigos",
			// 	loading_friends: "Cargando...",
			// 	refresh_friends: "Actualizar",
			// 	no_friends: "Aún no tienes amigos.",
			// 	chat_friends: "Chat",
			// 	removing_friends: "Eliminando...",
			// 	unfriend: "Eliminar amistad",

			// 	//Canvases
			// 	plan_group_proj: "Planifica tus proyectos en grupo",
			// 	create_canvas_proj: "Crea lienzos para planificación de proyectos y colaboración.",
			// 	your_canvases: "Tus lienzos ",
			// 	loading_canvases: "Cargando...",
			// 	max_3_canvases: "Máximo 3 lienzos",
			// 	add_canvas: "Añadir lienzo",
			// 	canvas_name_opt: "Nombre del lienzo (opcional)",
			// 	creating_canvas: "Creando...",
			// 	create_canvas: "Crear",
			// 	cancel_canvas: "Cancelar",
			// 	delete_canvas: "Eliminar",
			// 	no_canvas: "Aún no hay lienzos. ¡Crea uno para empezar!",
			// 	chat_rooms: "Salas de chat",
			// 	use_canvas: "Usa lienzos para dibujar, planificar y organizar trabajo en grupo.",
			// 	chat_room: "salas de chat",

			// 	//Canvas
			// 	apply_canvas: "Aplicar",
			// 	canvas_canvas: "Lienzo",
			// 	clear_canvas: "Limpiar",
			// 	background_canvas: "Fondo",
			// 	line_color_canvas: "Color de línea",
			// 	tool_canvas: "Herramienta",
			// 	cursor_canvas: "Cursor",
			// 	freehand_canvas: "Mano alzada",
			// 	eraser_canvas: "Borrador",
			// 	line_canvas: "Línea",
			// 	arrow_canvas: "Flecha",
			// 	rect_canvas: "Rectángulo",
			// 	rounded_rect_canvas: "Rectángulo redondeado",
			// 	circle_canvas: "Círculos",
			// 	text_canvas: "Texto",
			// 	textbox_canvas: "Caja de texto",
			// 	rounded_textbox_canvas: "Caja de texto redondeada",
			// 	fill_shape_canvas: "Rellenar forma",
			// 	text_font_canvas: "Fuente de texto",
			// 	stroke_weight_canvas: "Grosor de trazo",
			// 	zoom_canvas: "Zoom",

			// 	//Profile
			// 	dashboard_prof: "← Panel",
			// 	edit_profile: "Editar perfil",
			// 	update_prof: "Actualiza la información de tu cuenta y avatar.",
			// 	account_details: "Detalles de la cuenta",
			// 	username_prof: "Nombre de usuario",
			// 	new_pass_prof: "Nueva contraseña",
			// 	leave_blank_prof: "Déjalo en blanco para mantener la actual",
			// 	confirm_new_pass_prof: "Confirmar nueva contraseña",
			// 	repeat_new_prof: "Repite la nueva contraseña",
			// 	curr_pass_prof: "Contraseña actual",
			// 	req_save_prof: "Requerido para guardar cambios",
			// 	saving_change_prof: "Guardando...",
			// 	save_change_prof: "Guardar cambios",
			// 	save_avatar: "Guardar avatar",
			// 	cancel_prof: "Cancelar",
			// 	preview_avatar: "Vista previa",
			// 	others_see_avatar: "Así te verán los demás",

			// 	//App
			// 	page_doesnt_exist: "Esta página no existe.",
			// 	go_home: "Ir al inicio",

			// 	//chat
			// 	direct_chat: "Chat directo",
			// 	open_chat: "Abrir",
			// 	talking_to_chat: "Hablando con:",
			// 	select_username_chat: "Selecciona un usuario para empezar a chatear",
			// 	no_messages_chat: "Aún no hay mensajes",
			// 	friend_username_chat: "Usuario amigo",
			// 	type_message_chat: "Escribe un mensaje",
			// 	send_chat: "Enviar",
			// 	is_typing_chat: "está escribiendo...",

			// 	//conversations
			// 	dashboard_convo: "Panel",
			// 	choose_convo: "Elige tipo de conversación",
			// 	pick_how_convo: "Elige cómo quieres chatear.",
			// 	one_to_one_convo: "Conversación 1 a 1",
			// 	group_chat_convo: "Chats grupales",

			// 	//groupChats
			// 	group_chats_gcs: "Chats grupales",
			// 	create_groups_gcs: "Crea grupos y chatea con varios amigos.",
			// 	create_group_gcs: "Crear grupo",
			// 	you_need_friends_gcs: "Necesitas amigos para crear un grupo",
			// 	creating_gcs: "Creando...",
			// 	create_button_gcs: "Crear grupo",
			// 	refresh_gcs: "Actualizar",
			// 	no_groups_gcs: "Aún no hay grupos.",
			// 	members_gcs: "miembros",
			// 	open_chat_gcs: "Abrir chat",
				
			// 	//searchFriends
			// 	dashboard_friends: "Panel",
			// 	profile_friends: "Perfil",
			// 	search_friends: "Buscar amigos",
			// 	find_friends: "Encuentra usuarios por nombre de usuario o email",
			// 	search_user: "Buscar por nombre de usuario o email...",
			// 	searching_friends: "Buscando...",
			// 	search_button: "Buscar",
			// 	no_results_friends: "No se encontraron resultados",
			// 	no_user_match_friends: "Ningún usuario coincide con tu búsqueda",
			// 	results_friends: "Resultados",
			// 	requested_friends: "✓ Solicitado",
			// 	add_friends: "+ Añadir"
			// },
		},
	}
})





const LanguageSwitcher: React.FC = ({
	top = 15,
	right = 15,
}) => {
	return (
		<button
			className="theme-toggle"
			title="Change language"
			style={{ position: "fixed", top, right }}
			onClick={changeLanguage}
		>
		{i18n.language === "pt" ? "🇵🇹" : "🇬🇧"}
		</button>
	);
};

export default LanguageSwitcher;