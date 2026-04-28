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
				//Home
					HO_slogan_1: "Think together,",
					HO_slogan_2: "in real time.",
					HO_description_1: "A shared canvas for your team - draw, plan,",
					HO_description_2: "and collaborate without the noise.",
					HO_sign_up: "Get started →",
					HO_log_in: "Log in",

				//UserSignup
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

				//UserLogin
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

				//Dashboard
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
					TFC_verifying: "Verifying...",
					TFC_confirm: "Confirm",
					TFC_tip: "Tip: paste is supported for the full code.",
					TFC_disable: "Disable verification",
					TFC_step1: "Step 1 — Start setup",
					TFC_step2: "Step 2 — Scan and verify",

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
					CV_save: "Saving...",

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

				//App
					page_doesnt_exist: "This page doesn't exist.",
					go_home: "Go home",

				//Chat
					CH_direct_chat: "Direct Chat",
					CH_open_chat: "Open this page from your friends list.",
					CH_talking_to_chat: "Talking to:",
					CH_select_username_chat: "Select a username to start chatting",
					CH_no_messages_chat: "No messages yet.",
					CH_friend_username_chat: "Friend username",
					CH_type_message_chat: "Type a message",
					CH_send_chat: "Send",
					CH_is_typing_chat: "is typing...",

				//Conversations
					CO_dashboard: "Dashboard",
					CO_choose: "Choose Conversation Type",
					CO_pick_how: "Pick how you want to chat.",
					CO_one_to_one: "1 to 1 Conversation",
					CO_group_chat: "Group Chats",

				//GroupChats
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
					GCS_my_groups: "My groups",
					GCS_delete: "Delete",
					GCS_leave: "Leave",
				
				//SearchFriends
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

				//Blocked Users
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

				//User Profiles
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

				//Others
					NF_doesnt_exist: "This page doesn't exist.",
					NF_dash: "← Go to dashboard",
					FT_priv: "Privacy Policy",
					FT_terms: "Terms of Service",

				//Privacy Policy
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


				//Terms of Service
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
			translation: {				
				//Home
					HO_slogan_1: "Pensa em conjunto,",
					HO_slogan_2: "em tempo real.",
					HO_description_1: "Um canvas partilhado pela tua equipa:",
					HO_description_2: "desenha, planeia e colabora sem incómodo.",
					HO_sign_up: "Começar",
					HO_log_in: "Iniciar sessão",

				//UserSignup
					SU_create_account: "Criar conta de workspace",
					SU_username: "Nome de utilizador",
					SU_your_name: "o teu utilizador",
					SU_your_email: "oteunome@exemplo.com",
					SU_password: "palavra-passe",
					SU_your_password: "pelo menos 6 caractéres",
					SU_next: "Seguinte",
					SU_choose_avatar: "Escolher foto de perfil",
					SU_how_others_see_you: "Isto é como outros te vão ver",
					SU_default_avatars: "Fotos de perfil pré-definidas",
					SU_upload_your_own: "Carrega uma imagem tua",
					SU_choose_image: "Escolher imagem",
					SU_image_loaded: "Imagem carregada",
					SU_image_loaded_avatar: "✓ Imagem carregada — Carrega guardar",
					SU_creating_account: "A criar conta...",
					SU_create_accout_confirm: "Criar conta →",
					SU_back: "← Atrás",
					SU_already_have_account: "Já tens conta?",
					SU_8chars: "8+ caracteres",
					SU_1up: "1 letra maiúscula",
					SU_1low: "1 letra minúscula",
					SU_1num: "1 número",
					SU_1sym: "1 símbolo",
					SU_user_req: "O nome de utilizador é obrigatório",
					SU_user_cannot: "O nome de utilizador não pode conter espaços",
					SU_email_req: "O email é obrigatório",
					SU_avatar_only: "Apenas JPG, PNG ou WebP são permitidos",
					SU_under2mb: "A imagem deve ter menos de 2MB",
					SU_signup_failed: "Falha ao criar conta",
					SU_network_error: "Erro de rede. Tenta novamente",
					SU_fast_setup: "Configuração rápida com email ou registo OAuth.",
					SU_spaces_not: "Espaços não são permitidos no nome de utilizador.",
					SU_pass_place: "8+ caracteres, maiúscula, minúscula, número, símbolo",
					SU_hide_pass: "Ocultar palavra-passe",
					SU_show_pass: "Mostrar palavra-passe",
					SU_hide: "Ocultar",
					SU_show: "Mostrar",
					SU_pass_check: "Requisitos da palavra-passe",
					SU_or: "ou",
					SU_redir_google: "A redirecionar para o Google...",
					SU_sign_google: "Registar com Google",
					SU_redir_42: "A redirecionar para a 42...",
					SU_sign_42: "Registar com 42",
					SU_OAuth: "O OAuth abre uma página segura do fornecedor e volta automaticamente.",
					SU_signin: "Iniciar sessão",

				//UserLogin
					LI_sign_in_workspace: "Inicia sessão no teu workspace",
					LI_signing_in: "A iniciar sessão...",
					LI_sign_in_confirm: "Iniciar sessão →",
					LI_open_auth_app: "Abre a tua aplicação de autenticação e insere o cõdigo de 6 dígitos.",
					LI_auth_code: "Código de autenticação",
					LI_verifying: "A verificar...",
					LI_verify: "Verificar →",
					LI_back_to_login: "← De volta ao início de sessão",
					LI_dont_have_acc: "Não tens conta?",
					LI_create_one: "Cria uma",
					LI_sess_exp: "Sessão expirada. Inicia sessão novamente.",
					LI_signin_fail: "Falha no login com OAuth. Tenta novamente.",
					LI_oauth_unav: "O OAuth está indisponível de momento. Tenta email/palavra-passe ou contacta o suporte.",
					LI_login_fail: "Falha ao iniciar sessão",
					LI_network_fail_try: "Erro de rede. Tenta novamente.",
					LI_enter_6: "Insere o código de 6 dígitos",
					LI_inv_code: "Código inválido",
					LI_network_fail: "Erro de rede",
					LI_init_oauth1: "A iniciar ",
					LI_two_auth: "Verificação de dois fatores",
					LI_secure: "Acesso seguro ao teu painel colaborativo.",
					LI_or: "ou",
					LI_continue_google: "Continuar com Google",
					LI_continue_42: "Continuar com 42",
					LI_oauth_opens: "O OAuth abre uma página segura do fornecedor e volta automaticamente.",
					LI_tip_code: "Dica: podes colar o código completo de 6 dígitos.",

				//Dashboard
					DB_profile: "Perfil",
					DB_add_friend: "Adicionar amigo",
					DB_friend_req: "Pedidos de amizade",
					DB_no_pend_req: "Nenhum pedido de amizade.",
					DB_refresh_req: "Atualizar",
					DB_accept_req: "Aceitar",
					DB_reject_req: "Rejeitar",
					DB_sign_out: "Terminar sessão",
					DB_welcome_back: "Bem vindo de volta, ",
					DB_manage_acc_sec: "Opções de conta e de seguranca",
					DB_talk_to_friends: "Falar com amigos",
					DB_open_dashboard: "Abrir",
					DB_plan_projects: "Planeia os teus projetos",
					DB_desc: "Ações rápidas, atualizações sociais e segurança da conta num só lugar.",
					DB_quick: "Ações rápidas",
					DB_start: "Começa por adicionar um amigo ou entra nos teus espaços ativos.",
					DB_open_convo: "Abrir conversas",
					DB_open_canvas: "Abrir canvases",
					DB_blocked: "Utilizadores bloqueados",
					DB_security: "Segurança",
					DB_social: "Social",
					DB_close: "Fechar",
					DB_search: "Pesquisar por nome de utilizador ou email",
					DB_load_pend: "A carregar pedidos pendentes...",
					DB_invite: "Convida alguém pelo nome de utilizador ou email. Eles vão receber um pedido de amizade.",
					DB_no_users: "Nenhum utilizador encontrado.",
					DB_request: "Pedido enviado",
					DB_invitebutton: "Convidar",

				//TwoFactorCard
					TFC_two_fac_auth: "Autenticação de dois fatores",
					TFC_protect_acc_2fa: "Protege a tua conta com um código de utilização única a partir de uma aplicação de autenticação",
					TFC_enabled_2fa: "Ligada",
					TFC_disabled_2fa: "Desligada",
					TFC_loading_2fa: "A carregar...",
					TFC_enable_2fa: "Ativar 2FA",
					TFC_scan_2fa: "Lê o código com Google Authenticator ou Authy",
					TFC_wont_see_2fa: "Não irás ver este código de novo",
					TFC_enter_2fa: "Escreve o código de 6 dígitos da tua aplicação para confirmar",
					TFC_confirm_2fa: "Confirmar",
					TFC_acc_protected_2fa: "A tua conta esta protegida. Um código de autenticação e necessário para todas as sessões",
					TFC_disable_2fa: "Desativar 2FA",
					TFC_enter_curr_2fa: "Escreve o código de autenticação atual",
					TFC_disabling_2fa: "A desativar...",
					TFC_cancel_2fa: "Cancelar",
					TFC_verifying: "A verificar...",
					TFC_confirm: "Confirmar",
					TFC_tip: "Dica: é possível colar o código completo.",
					TFC_disable: "Desativar verificação",
					TFC_step1: "Passo 1 — Iniciar configuração",
					TFC_step2: "Passo 2 — Ler e verificar",

				//FriendsCard
					FRC_my_friends: "Amigos",
					FRC_loading: "A carregar...",
					FRC_refresh: "Atualizar",
					FRC_no_friends: "Ainda não tens amigos.",
					FRC_chat: "Conversas",
					FRC_remove: "A remover...",
					FRC_unfriend: "Remover amigo",

				//Canvases
					CVS_plan_group_proj: "Planeia os teus projetos",
					CVS_create_canvas_proj: "Cria canvas para planeamento de projeto e colaboração",
					CVS_your_canvases: "Os teus canvas",
					CVS_loading_canvases: "A carregar...",
					CVS_max_3_canvases: "Máximo: 3 canvas",
					CVS_add_canvas: "Adicionar canvas",
					CVS_canvas_name_opt: "Nome do canvas (opcional)",
					CVS_creating_canvas: "A criar...",
					CVS_create_canvas: "Criar",
					CVS_cancel_canvas: "Cancelar",
					CVS_delete_canvas: "Eliminar",
					CVS_no_canvas: "Não tens canvas. Cria um para começar!",
					CVS_chat_rooms: "Salas de conversa",
					CVS_use_canvas: "Usa o canvas para desenhar, planear e organizar trabalho de grupo",
					CVS_chat_room: "Salas de conversa",
					CVS_failed_load_cvs: "Falha ao carregar canvases",
					CVS_network_fail_load_cvs: "Erro de rede ao carregar amigos",
					CVS_failed_load_friends: "Falha ao carregar canvases",
					CVS_network_fail_load_friends: "Erro de rede ao carregar amigos",
					CVS_failed_create: "Falha ao criar canvas",
					CVS_network_fail_create: "Erro de rede ao eliminar canvas",
					CVS_failed_delete: "Falha ao criar canvas",
					CVS_network_fail_delete: "Erro de rede ao eliminar canvas",
					CVS_failed_invite: "Falha ao convidar amigo",
					CVS_network_fail_invite: "Erro de rede ao convidar amigo",
					CVS_close_invite: "Fechar convite",
					CVS_invite: "Convidar",
					CVS_no_friends: "Sem amigos disponíveis para convidar.",
					CVS_inviting: "A convidar...",

				//Canvas
					CV_apply: "Aplicar",
					CV_canvas: "Canvas",
					CV_clear: "Eliminar",
					CV_background: "Background",
					CV_line_color: "Cor de linha",
					CV_tool: "Ferramenta",
					CV_CV_cursor: "Cursor",
					CV_freehand: "Mão livre",
					CV_eraser: "Borracha",
					CV_line: "Linha",
					CV_arrow: "Seta",
					CV_rect: "Retângulo",
					CV_rounded_rect: "Retângulo arredondado",
					CV_circle: "Circulo",
					CV_text: "Texto",
					CV_textbox: "Caixa de texto",
					CV_rounded_textbox: "Caixa de texto arredondada",
					CV_fill_shape: "Preencher forma",
					CV_text_font: "Fonte de texto",
					CV_stroke_weight: "Peso de escrita",
					CV_zoom: "Zoom",
					CV_save: "A guardar...",

				//Profile
					PF_dashboard: "← Dashboard",
					PF_edit_profile: "Editar perfil",
					PF_update: "Atualizar a informação da conta e foto de perfil.",
					PF_account_details: "Detalhes da conta",
					PF_username_: "Nome de utilizador",
					PF_new_pass: "Nova palavra-passe",
					PF_leave_blank: "Deixa em branco para manter a mesma",
					PF_confirm_new_pass: "Confirmar palavra-passe novaZ",
					PF_repeat_new: "Repete a nova palavra-passe",
					PF_curr_pass: "Palavra-passe atual",
					PF_req_save: "Necessário para aplicar mudanças",
					PF_saving_change: "A guardar...",
					PF_save_change: "Guardar alterações",
					PF_save_avatar: "Guardar foto de perfil",
					PF_cancel: "Cancelar",
					PF_preview_avatar: "Pre-visualizar",
					PF_others_see_avatar: "Isto é como os outros vão ver-te",
					PF_settings: "Definições de perfil",
					PF_manage: "Gere os detalhes da tua conta, avatar e preferências de segurança.",
					PF_quick: "Ações rápidas",
					PF_avatar: "Alterar avatar",
					PF_blocked: "Utilizadores bloqueados",
					PF_dash: "Dashboard",
					PF_curr_avatar: "Avatar atual",
					PF_account: "Detalhes da conta",
					PF_identity: "Identidade",
					PF_username: "Nome de utilizador",
					PF_pass_rules: "Regras da palavra-passe:",
					PF_pass_mismatch: "As palavras-passe não coincidem.",
					PF_verification: "Verificação",
					PF_pass_req: "obrigatório",
					PF_make: "Faz uma alteração para ativar a gravação.",
					PF_curr_pass_save: "Insere a palavra-passe atual para guardar alterações.",

				//App
					page_doesnt_exist: "Esta página não existe.",
					go_home: "Ir para a página principal",

				//Chat
					CH_direct_chat: "Conversas privadas",
					CH_open_chat: "Abrir",
					CH_talking_to_chat: "A falar com:",
					CH_select_username_chat: "Seleciona um utilizador para conversar",
					CH_no_messages_chat: "Sem mensagens",
					CH_friend_username_chat: "Nome de amigo",
					CH_type_message_chat: "Escreve uma mensagem",
					CH_send_chat: "Enviar",
					CH_is_typing_chat: "está a escrever...",

				//Conversations
					CO_dashboard: "Dashboard",
					CO_choose: "Escolher tipo de conversa",
					CO_pick_how: "Escolhe como queres conversar.",
					CO_one_to_one: "Conversa 1 para 1",
					CO_group_chat: "Conversa de grupo",

				//GroupChats
					GCS_group_chats: "Conversas de grupo",
					GCS_create_groups: "Cria grupos e conversa com múltiplos amigos",
					GCS_create_group: "Cria um grupo",
					GCS_you_need_friends: "Precisas de amigos para criar um grupo",
					GCS_creating: "A criar...",
					GCS_create: "Criar grupo",
					GCS_refresh: "Atualizar",
					GCS_no_groups: "Sem grupos.",
					GCS_members: "membros",
					GCS_open_chat: "Abrir conversa",
					GCS_my_groups: "Os meus grupos",
					GCS_delete: "Eliminar",
					GCS_leave: "Sair",

				//SearchFriends
					FRS_dashboard: "Dashboard",
					FRS_profile: "Perfil",
					FRS_search: "Pesquisar por amigos",
					FRS_find: "Pesquisar utilizadores por nome ou email",
					FRS_search_user: "Procurar por nome ou email...",
					FRS_searching: "A procurar...",
					FRS_search_button: "Procurar",
					FRS_no_results: "Nenhum resultado",
					FRS_no_user_match: "Nenhum utilizador coincide com a pesquisa",
					FRS_results: "Resultados",
					FRS_requested: "✓ Pedido",
					FRS_add: "+ Adicionar",

				//Others
					NF_doesnt_exist: "Esta página não existe.",
					NF_dash: "← Ir para o dashboard",
					FT_priv: "Política de Privacidade",
					FT_terms: "Termos de Serviço",

				//Blocked Users
					BLU_prof: "← Perfil",
					BLU_dash: "Dashboard",
					BLU_blocked: "Utilizadores bloqueados",
					BLU_manage: "Gere os utilizadores que bloqueaste.",
					BLU_list: "Lista de bloqueados",
					BLU_refreshing: "A atualizar...",
					BLU_refresh: "Atualizar",
					BLU_loading: "A carregar utilizadores bloqueados...",
					BLU_no_blocked: "Não tens utilizadores bloqueados.",
					BLU_when: "Quando bloqueares alguém, aparecerá aqui.",
					BLU_view: "Ver perfil",
					BLU_unblocking: "A desbloquear...",
					BLU_unblock: "Desbloquear",

				//User Profiles
					UPF_back: "← Voltar",
					UPF_dash: "Dashboard",
					UPF_prof: "Perfil do utilizador",
					UPF_view: "Ver informação do perfil",
					UPF_public: "Detalhes públicos",
					UPF_loading: "A carregar perfil...",
					UPF_joined: "Entrou em",
					UPF_blocked: "Estás bloqueado por este utilizador.",
					UPF_unblocking: "A desbloquear...",
					UPF_unblock: "Desbloqueado",
					UPF_message: "Mensagem",
					UPF_removing: "A remover...",
					UPF_remove: "Remover amigo",
					UPF_block: "Bloquear",
					UPF_request: "✓ Pedido",
					UPF_sending: "A enviar...",
					UPF_add: "Adicionar amigo",
					UPF_block2: "Bloquear",

				//Privacy Policy
					privacy_priv: "Política de Privacidade",
					privacy_last: "Última atualização: 13 de abril de 2026",
					privacy_back: "← Voltar ao início",
					privacy_details: "Detalhes da política",
					privacy_1: "1. Introdução\n\
						Esta Política de Privacidade explica como a Transcendence (\"nós\", \"nos\", \"nosso\" ou \"Empresa\") \
						recolhe, utiliza, divulga e processa de outra forma as informações pessoais em ligação \
						com o nosso website, aplicações móveis e serviços (coletivamente, os \"Serviços\"). \
						Por favor, leia esta Política de Privacidade com atenção. Se não concordar com as nossas políticas e práticas, \
						não utilize os nossos Serviços.\n\n",
					privacy_2: "2. Informações que recolhemos\n\
						2.1 Informações fornecidas diretamente por si\n\
						Podemos recolher informações da conta como o seu nome, endereço de email, palavra-passe e informações de perfil quando se regista; informações de autenticação se utilizar OAuth 2.0 através do Google ou da 42 School; dados de comunicação como mensagens, conversas e conteúdo de chat; dados de canvas como conteúdo, desenhos e informações colaborativas relacionadas com as funcionalidades de canvas; e preferências do utilizador como definições da conta, tema e notificações.\n\
						2.2 Informações recolhidas automaticamente\n\
						Podemos recolher informações do dispositivo como tipo de dispositivo, sistema operativo e tipo de navegador; dados de utilização como páginas visitadas, funcionalidades utilizadas, ações realizadas e tempo passado nos Serviços; endereço IP e localização geográfica aproximada; e cookies e tecnologias semelhantes para rastrear atividade e preferências do utilizador.\n\
						2.3 Informações de terceiros\n\
						Podemos receber informações de fornecedores OAuth como Google e 42 School, bem como informações que outros utilizadores fornecem sobre si ao utilizar os nossos Serviços, como pedidos de amizade ou menções em conversas.\n\n",
					privacy_3: "3. Como utilizamos as suas informações\n\
						Utilizamos as informações recolhidas para fornecer, manter e melhorar os Serviços; criar e gerir a sua conta; enviar comunicações relacionadas com o serviço e responder aos seus pedidos; personalizar a sua experiência; compreender como os utilizadores interagem com os Serviços e melhorar a funcionalidade; detetar, prevenir e resolver fraudes e problemas de segurança; cumprir leis e regulamentos aplicáveis; e monitorizar o desempenho do sistema e atividade dos utilizadores através de métricas Prometheus.\n\n",
					privacy_4: "4. Como partilhamos as suas informações\n\
						4.1 Partilha de informações\n\
						Podemos partilhar as suas informações com colaboradores de canvas e amigos que podem ver o seu perfil e conteúdo partilhado; com prestadores de serviços que nos ajudam a operar os Serviços; quando exigido por lei ou processo legal; em caso de fusão ou aquisição; com informação limitada para implementar funcionalidades de bloqueio; e com outros utilizadores relativamente a informações que escolha tornar públicas.\n\
						4.2 Informações que não partilhamos\n\
						Não vendemos nem alugamos as suas informações pessoais a terceiros. Não partilhamos palavras-passe nem credenciais de autenticação. Não partilhamos mensagens privadas sem o seu consentimento, exceto quando exigido por lei.\n\n",
					privacy_5: "5. Segurança dos dados\n\
						Implementamos medidas técnicas e organizacionais adequadas para proteger as suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão na internet é 100% seguro e não podemos garantir segurança absoluta.\n\n",
					privacy_6: "6. Retenção de dados\n\
						Mantemos as suas informações pessoais enquanto a sua conta estiver ativa ou conforme necessário para fornecer os Serviços. Quando eliminar a sua conta, iremos apagar ou anonimizar os seus dados no prazo de 30 dias, exceto quando for necessário mantê-los por obrigação legal ou razões legítimas de negócio.\n\n",
					privacy_7: "7. Autenticação de dois fatores\n\
						Oferecemos autenticação de dois fatores (2FA) para aumentar a segurança da conta. A ativação adiciona uma camada extra de proteção através de códigos temporários (TOTP).\n\n",
					privacy_8: "8. Controlo e direitos do utilizador\n\
						Tem o direito de aceder e rever as suas informações pessoais através das definições da conta, atualizar ou corrigir dados incorretos, solicitar a eliminação da conta e dados associados, pedir uma cópia dos seus dados em formato portátil e retirar o consentimento para determinados tratamentos. Para exercer estes direitos, contacte-nos conforme indicado na Secção 10.\n\n",
					privacy_9: "9. Privacidade de menores\n\
						Os Serviços não se destinam a menores de 13 anos e não recolhemos intencionalmente dados pessoais de menores de 13 anos. Se tomarmos conhecimento de tal situação, iremos eliminar essas informações.\n\n",
					privacy_10: "10. Contacte-nos\n\
						Se tiver dúvidas sobre esta Política de Privacidade ou práticas de privacidade, contacte-nos através de: Email: privacy@transcendence.local. Endereço: Transcendence Services, 42 School, Paris, França.\n\n",
					privacy_11: "11. Alterações a esta Política de Privacidade\n\
						Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos alterações relevantes através da publicação da política atualizada e da alteração da data de \"Última atualização\". A continuação da utilização dos Serviços após essas alterações constitui a sua aceitação.\n\n",
					privacy_12: "Fim da Política de Privacidade",

				//Terms of Service
					terms_terms: "Termos de Serviço",
					terms_last: "Última atualização: 13 de abril de 2026",
					terms_back: "← Voltar ao início",
					terms_serv: "Termos do serviço",
					terms_1: "1. Aceitação dos Termos\n\
						Ao aceder e utilizar o Transcendence (\"Serviço\", \"nós\", \"nos\" ou \"Empresa\"), concorda em ficar vinculado a estes Termos de Serviço. Se não concordar com estes termos, não poderá aceder nem utilizar o Serviço. Reservamo-nos o direito de modificar estes termos a qualquer momento, e a continuação da utilização do Serviço após alterações constitui a sua aceitação dos termos modificados.\n\n",
					terms_2: "2. Licença de Utilização\n\
						2.1 Concessão de Licença\n\
						Concedemos-lhe uma licença limitada, não exclusiva e revogável para aceder e utilizar o Serviço apenas para fins legais, sujeita ao cumprimento destes Termos de Serviço.\n\
						2.2 Restrições\n\
						Concorda em não reproduzir, distribuir ou transmitir qualquer conteúdo sem autorização adequada. Concorda em não modificar, adaptar, traduzir ou criar trabalhos derivados do Serviço. Concorda em não realizar engenharia reversa, descompilar ou tentar descobrir o código-fonte ou tecnologia subjacente. Concorda em não utilizar o Serviço para fins ilegais ou não autorizados. Concorda em não introduzir vírus, malware ou outro código malicioso. Concorda em não tentar obter acesso não autorizado ao Serviço ou aos seus sistemas. Concorda em não assediar, abusar, difamar ou ameaçar outros utilizadores. Concorda em não enviar spam ou mensagens não solicitadas. Concorda em não utilizar ferramentas automatizadas (bots, scrapers) sem autorização. Concorda em não contornar medidas de segurança ou restrições de acesso.\n\n",
					terms_3: "3. Contas de Utilizador\n\
						3.1 Registo de Conta\n\
						Para aceder a determinadas funcionalidades do Serviço, deve criar uma conta. É responsável por manter a confidencialidade da sua palavra-passe e informações da conta. Concorda em fornecer informações precisas, atuais e completas durante o registo e em atualizá-las conforme necessário.\n\
						3.2 Segurança da Conta\n\
						É responsável por todas as atividades realizadas na sua conta. Concorda em notificar-nos imediatamente de qualquer utilização não autorizada da sua conta ou qualquer outra violação de segurança.\n\
						3.3 Encerramento de Conta\n\
						Reservamo-nos o direito de suspender ou encerrar a sua conta se determinarmos que violou estes Termos de Serviço ou teve comportamentos ilegais ou prejudiciais.\n\n",
					terms_4: "4. Autenticação\n\
						4.1 OAuth 2.0\n\
						O Serviço suporta autenticação através de Google OAuth 2.0 e 42 School OAuth 2.0. Ao utilizar OAuth, está a conceder-nos permissão para aceder às informações desses serviços conforme indicado nos pedidos de autorização.\n\
						4.2 Autenticação de Dois Fatores\n\
						Recomendamos fortemente a ativação da autenticação de dois fatores (2FA) para maior segurança. É responsável por gerir e proteger as suas credenciais 2FA (códigos TOTP).\n\n",
					terms_5: "5. Conteúdo do Utilizador\n\
						5.1 Propriedade do Conteúdo\n\
						Mantém todos os direitos sobre o conteúdo que cria e carrega no Serviço (\"O Seu Conteúdo\"). Ao carregar conteúdo, concede-nos uma licença mundial, não exclusiva e isenta de royalties para utilizar, copiar, modificar e apresentar o seu conteúdo com o objetivo de operar e melhorar o Serviço.\n\
						5.2 Normas de Conteúdo\n\
						O seu conteúdo não deve violar leis ou regulamentos aplicáveis, infringir direitos de propriedade intelectual de terceiros, conter material difamatório, obsceno, ofensivo ou prejudicial, constituir spam ou promoção não solicitada, ou incluir dados pessoais de terceiros sem consentimento.\n\
						5.3 Moderação\n\
						Reservamo-nos o direito de remover, editar ou recusar publicar qualquer conteúdo que viole estes Termos de Serviço ou leis aplicáveis.\n\n",
					terms_6: "6. Canvas e Funcionalidades Colaborativas\n\
						6.1 Partilha de Canvas\n\
						Ao partilhar um canvas com outros utilizadores, estes obtêm os direitos de acesso definidos por si. É responsável pela gestão das permissões.\n\
						6.2 Responsabilidade Colaborativa\n\
						Os utilizadores que colaboram num canvas comprometem-se a respeitar direitos de propriedade intelectual e a não utilizar estas funcionalidades para assédio ou abuso.\n\
						6.3 Dados de Canvas\n\
						Os canvases e dados associados podem ser armazenados nos nossos servidores. Embora implementemos medidas de segurança, não somos responsáveis por perda de dados ou acessos não autorizados.\n\n",
					terms_7: "7. Comunicações e Chat\n\
						7.1 Privacidade das Mensagens\n\
						As mensagens privadas destinam-se a ser privadas. No entanto, podemos aceder às mesmas por motivos de segurança, legais ou prevenção de abuso.\n\
						7.2 Registo de Conversas\n\
						As conversas podem ser armazenadas temporariamente nos nossos servidores para fins de funcionamento do serviço. Pode eliminar as suas conversas a qualquer momento.\n\
						7.3 Bloqueio e Denúncia\n\
						Pode bloquear outros utilizadores para impedir contacto. Em caso de assédio ou abuso, pode reportar utilizadores à nossa equipa de moderação.\n\n",
					terms_8: "8. Limitação de Responsabilidade\n\
						8.1 Sem Danos Consequentes\n\
						Na máxima extensão permitida por lei, não seremos responsáveis por danos indiretos, incidentais, especiais, consequenciais ou punitivos, nem por perda de lucros, receitas, dados ou oportunidades de negócio.\n\
						8.2 Limite de Responsabilidade\n\
						A nossa responsabilidade total por quaisquer reclamações não excederá $100 ou o valor pago por si nos 12 meses anteriores à reclamação, o que for maior.\n\n",
					terms_9: "9. Conduta do Utilizador\n\
						Concorda em utilizar o Serviço apenas para fins legais e de forma a não infringir os direitos de terceiros. Comportamentos proibidos incluem assédio, ameaças, acesso não autorizado, recolha de dados pessoais sem consentimento e violação de leis aplicáveis.\n\n",
					terms_10: "10. Resolução de Litígios\n\
						10.1 Lei Aplicável\n\
						Estes Termos de Serviço são regidos pelas leis de França.\n\
						10.2 Resolução Informal\n\
						Antes de recorrer a meios formais, concorda em tentar resolver disputas informalmente contactando-nos.\n\n",
					terms_11: "11. Encerramento\n\
						11.1 Por Si\n\
						Pode encerrar a sua conta a qualquer momento através das definições ou contactando-nos.\n\
						11.2 Por Nós\n\
						Podemos suspender ou terminar o seu acesso imediatamente se violar estes Termos ou tiver comportamento ilegal ou prejudicial.\n\n",
					terms_12: "12. Informações de Contacto\n\
						Para questões sobre estes Termos, contacte-nos: Email: legal@transcendence.local. Endereço: Transcendence Services, 42 School, Paris, França.\n\n",
					terms_13: "13. Acordo Integral\n\
						Estes Termos, juntamente com a Política de Privacidade, constituem o acordo completo entre si e nós relativamente ao Serviço.\n\n",
					terms_14: "AO UTILIZAR O SERVIÇO, DECLARA QUE LEU, COMPREENDEU E ACEITA ESTES TERMOS DE SERVIÇO.\n\n",
			},
		},
		es: {
			translation: {
				//Home
					HO_slogan_1: "Piensa juntos,",
					HO_slogan_2: "en tiempo real.",
					HO_description_1: "Un lienzo compartido para tu equipo - dibuja, planifica,",
					HO_description_2: "y colabora sin ruido.",
					HO_sign_up: "Comenzar",
					HO_log_in: "Iniciar sesión",

				//UserSignup
					SU_create_account: "Crea tu cuenta de espacio de trabajo",
					SU_username: "Nombre de usuario",
					SU_your_name: "Tu nombre",
					SU_your_email: "tu@ejemplo.com",
					SU_password: "Contraseña",
					SU_your_password: "al menos 6 caracteres",
					SU_next: "Siguiente",
					SU_choose_avatar: "Elige tu avatar",
					SU_how_others_see_you: "Así es como otros te verán.",
					SU_default_avatars: "Avatares predeterminados",
					SU_upload_your_own: "Sube el tuyo",
					SU_choose_image: "Elegir imagen",
					SU_image_loaded: "Imagen cargada",
					SU_creating_account: "Creando cuenta...",
					SU_create_accout_confirm: "Crear cuenta →",
					SU_back: "← Atrás",
					SU_already_have_account: "¿Ya tienes una cuenta?",
					SU_8chars: "8+ caracteres",
					SU_1up: "1 letra mayúscula",
					SU_1low: "1 letra minúscula",
					SU_1num: "1 número",
					SU_1sym: "1 símbolo",
					SU_user_req: "El nombre de usuario es obligatorio",
					SU_user_cannot: "El nombre de usuario no puede contener espacios",
					SU_email_req: "El correo electrónico es obligatorio",
					SU_avatar_only: "Solo se permiten JPG, PNG o WebP",
					SU_under2mb: "La imagen debe ser menor de 2MB",
					SU_signup_failed: "Error al crear la cuenta",
					SU_network_error: "Error de red. Inténtalo de nuevo",
					SU_fast_setup: "Configuración rápida con correo o registro OAuth.",
					SU_spaces_not: "No se permiten espacios en el nombre de usuario.",
					SU_pass_place: "8+ caracteres, mayúscula, minúscula, número, símbolo",
					SU_hide_pass: "Ocultar contraseña",
					SU_show_pass: "Mostrar contraseña",
					SU_hide: "Ocultar",
					SU_show: "Mostrar",
					SU_pass_check: "Requisitos de la contraseña",
					SU_or: "o",
					SU_redir_google: "Redirigiendo a Google...",
					SU_sign_google: "Registrarse con Google",
					SU_redir_42: "Redirigiendo a 42...",
					SU_sign_42: "Registrarse con 42",
					SU_OAuth: "OAuth abre una página segura del proveedor y te devuelve automáticamente.",
					SU_signin: "Iniciar sesión",

				//UserLogin
					LI_sign_in_workspace: "Inicia sesión en tu espacio de trabajo",
					LI_signing_in: "Iniciando sesión...",
					LI_sign_in_confirm: "Iniciar sesión →",
					LI_open_auth_app: "Abre tu aplicación de autenticación e introduce el código de 6 dígitos.",
					LI_auth_code: "Código de autenticación",
					LI_verifying: "Verificando...",
					LI_verify: "Verificar →",
					LI_back_to_login: "← Volver al inicio de sesión",
					LI_dont_have_acc: "¿No tienes una cuenta?",
					LI_create_one: "Crea una",
					LI_sess_exp: "La sesión ha expirado. Inicia sesión de nuevo.",
					LI_signin_fail: "Error al iniciar sesión con OAuth. Inténtalo de nuevo.",
					LI_oauth_unav: "OAuth no está disponible actualmente. Usa correo/contraseña o contacta con soporte.",
					LI_login_fail: "Error al iniciar sesión",
					LI_network_fail_try: "Error de red. Inténtalo de nuevo.",
					LI_enter_6: "Introduce tu código de 6 dígitos",
					LI_inv_code: "Código inválido",
					LI_network_fail: "Error de red",
					LI_init_oauth1: "Iniciando ",
					LI_two_auth: "Verificación en dos factores",
					LI_secure: "Acceso seguro a tu panel colaborativo.",
					LI_or: "o",
					LI_continue_google: "Continuar con Google",
					LI_continue_42: "Continuar con 42",
					LI_oauth_opens: "OAuth abre una página segura del proveedor y te devuelve automáticamente.",
					LI_tip_code: "Consejo: puedes pegar el código completo de 6 dígitos.",

				//Dashboard
					DB_profile: "Perfil",
					DB_add_friend: "Añadir amigo",
					DB_friend_req: "Solicitudes de amistad",
					DB_no_pend_req: "No hay solicitudes pendientes.",
					DB_refresh_req: "Actualizar",
					DB_accept_req: "Aceptar",
					DB_reject_req: "Rechazar",
					DB_sign_out: "Cerrar sesión",
					DB_welcome_back: "Bienvenido de nuevo, ",
					DB_manage_acc_sec: "Gestiona tu cuenta y la configuración de seguridad.",
					DB_talk_to_friends: "Habla con amigos",
					DB_open_dashboard: "Abrir",
					DB_plan_projects: "Planifica tus proyectos",
					DB_desc: "Acciones rápidas, actualizaciones sociales y seguridad de la cuenta en un solo lugar.",
					DB_quick: "Acciones rápidas",
					DB_start: "Empieza añadiendo un amigo o entra en tus espacios activos.",
					DB_open_convo: "Abrir conversaciones",
					DB_open_canvas: "Abrir lienzos",
					DB_blocked: "Usuarios bloqueados",
					DB_security: "Seguridad",
					DB_social: "Social",
					DB_close: "Cerrar",
					DB_search: "Buscar por nombre de usuario o correo electrónico",
					DB_load_pend: "Cargando solicitudes pendientes...",
					DB_invite: "Invita a alguien por nombre de usuario o correo. Recibirá una solicitud de amistad.",
					DB_no_users: "No se encontraron usuarios.",
					DB_request: "Solicitado",
					DB_invitebutton: "Invitar",

				//TwoFactorCard
					TFC_two_fac_auth: "Autenticación de dos factores",
					TFC_protect_acc_2fa: "Protege tu cuenta con una contraseña de un solo uso basada en el tiempo desde una app de autenticación.",
					TFC_enabled_2fa: "Activado",
					TFC_disabled_2fa: "Desactivado",
					TFC_loading_2fa: "Cargando...",
					TFC_enable_2fa: "Activar 2FA",
					TFC_scan_2fa: "Escanea esto con Google Authenticator o Authy.",
					TFC_wont_see_2fa: "No lo volverás a ver.",
					TFC_enter_2fa: "Introduce el código de 6 dígitos de tu app para confirmar:",
					TFC_confirm_2fa: "Confirmar",
					TFC_acc_protected_2fa: "Tu cuenta está protegida. Se requiere un código de autenticación en cada inicio de sesión.",
					TFC_disable_2fa: "Desactivar 2FA",
					TFC_enter_curr_2fa: "Introduce tu código actual de autenticación para confirmar:",
					TFC_disabling_2fa: "Desactivando...",
					TFC_cancel_2fa: "Cancelar",
					TFC_verifying: "Verificando...",
					TFC_confirm: "Confirmar",
					TFC_tip: "Consejo: puedes pegar el código completo.",
					TFC_disable: "Desactivar verificación",
					TFC_step1: "Paso 1 — Iniciar configuración",
					TFC_step2: "Paso 2 — Escanear y verificar",

				//FriendsCard
					FRC_my_friends: "Mis amigos",
					FRC_loading: "Cargando...",
					FRC_refresh: "Actualizar",
					FRC_no_friends: "Aún no tienes amigos.",
					FRC_chat: "Chat",
					FRC_remove: "Eliminando...",
					FRC_unfriend: "Eliminar amistad",

				//Canvases
					CVS_plan_group_proj: "Planifica tus proyectos en grupo",
					CVS_create_canvas_proj: "Crea lienzos para planificación de proyectos y colaboración.",
					CVS_your_canvases: "Tus lienzos ",
					CVS_loading_canvases: "Cargando...",
					CVS_max_3_canvases: "Máximo 3 lienzos",
					CVS_add_canvas: "Añadir lienzo",
					CVS_canvas_name_opt: "Nombre del lienzo (opcional)",
					CVS_creating_canvas: "Creando...",
					CVS_create_canvas: "Crear",
					CVS_cancel_canvas: "Cancelar",
					CVS_delete_canvas: "Eliminar",
					CVS_no_canvas: "Aún no hay lienzos. ¡Crea uno para empezar!",
					CVS_chat_rooms: "Salas de chat",
					CVS_use_canvas: "Usa lienzos para dibujar, planificar y organizar trabajo en grupo.",
					CVS_chat_room: "salas de chat",
					CVS_failed_load_cvs: "Error al cargar lienzos",
					CVS_network_fail_load_cvs: "Error de red al cargar amigos",
					CVS_failed_load_friends: "Error al cargar lienzos",
					CVS_network_fail_load_friends: "Error de red al cargar amigos",
					CVS_failed_create: "Error al crear lienzo",
					CVS_network_fail_create: "Error de red al eliminar lienzo",
					CVS_failed_delete: "Error al crear lienzo",
					CVS_network_fail_delete: "Error de red al eliminar lienzo",
					CVS_failed_invite: "Error al invitar amigo",
					CVS_network_fail_invite: "Error de red al invitar amigo",
					CVS_close_invite: "Cerrar invitación",
					CVS_invite: "Invitar",
					CVS_no_friends: "No hay amigos disponibles para invitar.",
					CVS_inviting: "Invitando...",

				//Canvas
					CV_apply: "Aplicar",
					CV_canvas: "Lienzo",
					CV_clear: "Limpiar",
					CV_background: "Fondo",
					CV_line_color: "Color de línea",
					CV_tool: "Herramienta",
					CV_CV_cursor: "Cursor",
					CV_freehand: "Mano alzada",
					CV_eraser: "Borrador",
					CV_line: "Línea",
					CV_arrow: "Flecha",
					CV_rect: "Rectángulo",
					CV_rounded_rect: "Rectángulo redondeado",
					CV_circle: "Círculos",
					CV_text: "Texto",
					CV_textbox: "Caja de texto",
					CV_rounded_textbox: "Caja de texto redondeada",
					CV_fill_shape: "Rellenar forma",
					CV_text_font: "Fuente de texto",
					CV_stroke_weight: "Grosor de trazo",
					CV_zoom: "Zoom",
					CV_save: "Guardando...",

				//Profile
					PF_dashboard: "← Panel",
					PF_edit_profile: "Editar perfil",
					PF_update: "Actualiza la información de tu cuenta y avatar.",
					PF_account_details: "Detalles de la cuenta",
					PF_username_: "Nombre de usuario",
					PF_new_pass: "Nueva contraseña",
					PF_leave_blank: "Déjalo en blanco para mantener la actual",
					PF_confirm_new_pass: "Confirmar nueva contraseña",
					PF_repeat_new: "Repite la nueva contraseña",
					PF_curr_pass: "Contraseña actual",
					PF_req_save: "Requerido para guardar cambios",
					PF_saving_change: "Guardando...",
					PF_save_change: "Guardar cambios",
					PF_save_avatar: "Guardar avatar",
					PF_cancel: "Cancelar",
					PF_preview_avatar: "Vista previa",
					PF_others_see_avatar: "Así te verán los demás",
					PF_settings: "Configuración de perfil",
					PF_manage: "Gestiona los detalles de tu cuenta, avatar y preferencias de seguridad.",
					PF_quick: "Acciones rápidas",
					PF_avatar: "Cambiar avatar",
					PF_blocked: "Usuarios bloqueados",
					PF_dash: "Panel",
					PF_curr_avatar: "Avatar actual",
					PF_account: "Detalles de la cuenta",
					PF_identity: "Identidad",
					PF_username: "Nombre de usuario",
					PF_pass_rules: "Reglas de la contraseña:",
					PF_pass_mismatch: "Las contraseñas no coinciden.",
					PF_verification: "Verificación",
					PF_pass_req: "requerido",
					PF_make: "Realiza un cambio para habilitar el guardado.",
					PF_curr_pass_save: "Introduce tu contraseña actual para guardar los cambios.",

				//Chat
					CH_direct_chat: "Chat directo",
					CH_open_chat: "Abrir",
					CH_talking_to_chat: "Hablando con:",
					CH_select_username_chat: "Selecciona un usuario para empezar a chatear",
					CH_no_messages_chat: "Aún no hay mensajes",
					CH_friend_username_chat: "Usuario amigo",
					CH_type_message_chat: "Escribe un mensaje",
					CH_send_chat: "Enviar",
					CH_is_typing_chat: "está escribiendo...",

				//Conversations
					CO_dashboard: "Panel",
					CO_choose: "Elige tipo de conversación",
					CO_pick_how: "Elige cómo quieres chatear.",
					CO_one_to_one: "Conversación 1 a 1",
					CO_group_chat: "Chats grupales",

				//GroupChats
					GCS_group_chats: "Chats grupales",
					GCS_create_groups: "Crea grupos y chatea con varios amigos.",
					GCS_create_group: "Crear grupo",
					GCS_you_need_friends: "Necesitas amigos para crear un grupo",
					GCS_creating: "Creando...",
					GCS_create: "Crear grupo",
					GCS_refresh: "Actualizar",
					GCS_no_groups: "Aún no hay grupos.",
					GCS_members: "miembros",
					GCS_open_chat: "Abrir chat",
					GCS_my_groups: "Mis grupos",
					GCS_delete: "Eliminar",
					GCS_leave: "Salir",

				//SearchFriends
					FRS_dashboard: "Panel",
					FRS_profile: "Perfil",
					FRS_search: "Buscar amigos",
					FRS_find: "Encuentra usuarios por nombre de usuario o email",
					FRS_search_user: "Buscar por nombre de usuario o email...",
					FRS_searching: "Buscando...",
					FRS_search_button: "Buscar",
					FRS_no_results: "No se encontraron resultados",
					FRS_no_user_match: "Ningún usuario coincide con tu búsqueda",
					FRS_results: "Resultados",
					FRS_requested: "✓ Solicitado",
					FRS_add: "+ Añadir",

				//Others
					NF_doesnt_exist: "Esta página no existe.",
					NF_dash: "← Ir al panel",
					FT_priv: "Política de Privacidad",
					FT_terms: "Términos del Servicio",

				//Blocked Users
					BLU_prof: "← Perfil",
					BLU_dash: "Panel",
					BLU_blocked: "Usuarios bloqueados",
					BLU_manage: "Gestiona los usuarios que has bloqueado.",
					BLU_list: "Lista de bloqueados",
					BLU_refreshing: "Actualizando...",
					BLU_refresh: "Actualizar",
					BLU_loading: "Cargando usuarios bloqueados...",
					BLU_no_blocked: "No tienes usuarios bloqueados.",
					BLU_when: "Cuando bloquees a alguien, aparecerá aquí.",
					BLU_view: "Ver perfil",
					BLU_unblocking: "Desbloqueando...",
					BLU_unblock: "Desbloquear",

				//User Profile
					UPF_back: "← Volver",
					UPF_dash: "Panel",
					UPF_prof: "Perfil de usuario",
					UPF_view: "Ver información del perfil",
					UPF_public: "Detalles públicos",
					UPF_loading: "Cargando perfil...",
					UPF_joined: "Se unió",
					UPF_blocked: "Estás bloqueado por este usuario.",
					UPF_unblocking: "Desbloqueando...",
					UPF_unblock: "Desbloqueado",
					UPF_message: "Mensaje",
					UPF_removing: "Eliminando...",
					UPF_remove: "Eliminar amigo",
					UPF_block: "Bloquear",
					UPF_request: "✓ Solicitado",
					UPF_sending: "Enviando...",
					UPF_add: "Añadir amigo",
					UPF_block2: "Bloquear",

				//Privacy Policy
					privacy_priv: "Política de Privacidad",
					privacy_last: "Última actualización: 13 de abril de 2026",
					privacy_back: "← Volver al inicio",
					privacy_details: "Detalles de la política",
					privacy_1: "1. Introducción\n\
						Esta Política de Privacidad explica cómo Transcendence (\"nosotros\", \"nos\" o \"Empresa\") \
						recopila, utiliza, divulga y procesa de otro modo la información personal en relación \
						con nuestro sitio web, aplicaciones móviles y servicios (colectivamente, los \"Servicios\"). \
						Por favor, lee esta Política de Privacidad detenidamente. Si no estás de acuerdo con nuestras políticas y prácticas, \
						no utilices nuestros Servicios.\n\n",
					privacy_2: "2. Información que recopilamos\n\
						2.1 Información que proporcionas directamente\n\
						Podemos recopilar información de la cuenta como tu nombre, dirección de correo electrónico, contraseña e información de perfil cuando te registras; información de autenticación si utilizas OAuth 2.0 a través de Google o 42 School; datos de comunicación como mensajes, conversaciones y contenido de chat; datos de lienzo como contenido, dibujos e información colaborativa relacionada con nuestras funciones de lienzo; y preferencias del usuario como la configuración de la cuenta, preferencias de tema y notificaciones.\n\
						2.2 Información recopilada automáticamente\n\
						Podemos recopilar información del dispositivo como tipo de dispositivo, sistema operativo y tipo de navegador; datos de uso como páginas visitadas, funciones utilizadas, acciones realizadas y tiempo pasado en los Servicios; dirección IP y ubicación geográfica aproximada; y cookies y tecnologías similares utilizadas para rastrear la actividad y preferencias del usuario.\n\
						2.3 Información de terceros\n\
						Podemos recibir información de proveedores OAuth como Google y 42 School, así como información que otros usuarios proporcionan sobre ti al usar nuestros Servicios, como solicitudes de amistad o menciones en conversaciones.\n\n",
					privacy_3: "3. Cómo utilizamos tu información\n\
						Utilizamos la información recopilada para proporcionar, mantener y mejorar los Servicios; crear y gestionar tu cuenta; enviar comunicaciones relacionadas con el servicio y responder a tus consultas; personalizar tu experiencia y ofrecer contenido personalizado; comprender cómo interactúan los usuarios con los Servicios y mejorar su funcionalidad; detectar, prevenir y abordar fraudes y problemas de seguridad; cumplir con las leyes y regulaciones aplicables; y supervisar el rendimiento del sistema y la actividad de los usuarios mediante métricas de Prometheus.\n\n",
					privacy_4: "4. Cómo compartimos tu información\n\
						4.1 Intercambio de información\n\
						Podemos compartir tu información con colaboradores de lienzo y amigos que pueden ver tu perfil y contenido compartido; con proveedores de servicios que nos ayudan a operar los Servicios; cuando lo exija la ley o en respuesta a procesos legales; en caso de fusión o adquisición; con información limitada para aplicar funciones de bloqueo de usuarios; y con otros usuarios respecto a la información que elijas hacer pública.\n\
						4.2 Información que no compartimos\n\
						No vendemos ni alquilamos tu información personal a terceros. No compartimos contraseñas ni credenciales de autenticación. No compartimos mensajes privados sin tu consentimiento, salvo cuando lo exija la ley.\n\n",
					privacy_5: "5. Seguridad de los datos\n\
						Implementamos medidas técnicas y organizativas adecuadas para proteger tu información personal contra accesos no autorizados, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por internet es 100% seguro y no podemos garantizar seguridad absoluta.\n\n",
					privacy_6: "6. Conservación de datos\n\
						Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionar los Servicios. Cuando elimines tu cuenta, eliminaremos o anonimizaremos tu información en un plazo de 30 días, salvo cuando debamos conservarla por ley o por motivos comerciales legítimos.\n\n",
					privacy_7: "7. Autenticación en dos factores\n\
						Ofrecemos autenticación en dos factores (2FA) para mejorar la seguridad de la cuenta. Activarla añade una capa adicional de protección mediante códigos temporales (TOTP).\n\n",
					privacy_8: "8. Control y derechos del usuario\n\
						Tienes derecho a acceder y revisar tu información personal a través de la configuración de tu cuenta, actualizar o corregir datos inexactos, solicitar la eliminación de tu cuenta y datos asociados, solicitar una copia de tus datos en formato portátil y retirar el consentimiento para determinados tratamientos. Para ejercer estos derechos, contáctanos según la Sección 10.\n\n",
					privacy_9: "9. Privacidad de menores\n\
						Nuestros Servicios no están destinados a menores de 13 años y no recopilamos conscientemente información personal de menores de esa edad. Si detectamos que hemos recopilado información de un menor, tomaremos medidas para eliminarla.\n\n",
					privacy_10: "10. Contacto\n\
						Si tienes preguntas sobre esta Política de Privacidad o nuestras prácticas, contáctanos en: Email: privacy@transcendence.local. Dirección: Transcendence Services, 42 School, París, Francia.\n\n",
					privacy_11: "11. Cambios en esta Política de Privacidad\n\
						Podemos actualizar esta Política de Privacidad periódicamente. Notificaremos cambios importantes publicando la política actualizada y modificando la fecha de \"Última actualización\". El uso continuado de los Servicios tras dichos cambios implica tu aceptación.\n\n",
					privacy_12: "Fin de la Política de Privacidad",

				//Terms of Service
					terms_terms: "Términos de Servicio",
					terms_last: "Última actualización: 13 de abril de 2026",
					terms_back: "← Volver al inicio",
					terms_serv: "Términos del servicio",
					terms_1: "1. Aceptación de los términos\n\
						Al acceder y utilizar Transcendence (\"Servicio\", \"nosotros\", \"nos\" o \"Empresa\"), aceptas quedar sujeto a estos Términos de Servicio. Si no estás de acuerdo con estos términos, no podrás acceder ni utilizar el Servicio. Nos reservamos el derecho de modificar estos términos en cualquier momento, y el uso continuado del Servicio tras dichas modificaciones constituye tu aceptación de los términos modificados.\n\n",
					terms_2: "2. Licencia de uso\n\
						2.1 Concesión de licencia\n\
						Te concedemos una licencia limitada, no exclusiva y revocable para acceder y utilizar el Servicio únicamente con fines legales, siempre que cumplas con estos Términos de Servicio.\n\
						2.2 Restricciones\n\
						Aceptas no reproducir, distribuir ni transmitir ningún contenido sin la debida autorización. Aceptas no modificar, adaptar, traducir ni crear obras derivadas basadas en el Servicio. Aceptas no realizar ingeniería inversa, descompilar ni intentar descubrir el código fuente o la tecnología subyacente. Aceptas no utilizar el Servicio con fines ilegales o no autorizados. Aceptas no introducir virus, malware u otro código malicioso. Aceptas no intentar acceder sin autorización al Servicio o a sus sistemas. Aceptas no acosar, abusar, difamar ni amenazar a otros usuarios. Aceptas no enviar spam ni mensajes no solicitados. Aceptas no utilizar herramientas automatizadas (bots, scrapers) sin autorización. Aceptas no eludir medidas de seguridad o restricciones de acceso.\n\n",
					terms_3: "3. Cuentas de usuario\n\
						3.1 Registro de cuenta\n\
						Para acceder a ciertas funciones del Servicio, debes crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de la información de tu cuenta. Aceptas proporcionar información precisa, actual y completa durante el registro y actualizarla cuando sea necesario.\n\
						3.2 Seguridad de la cuenta\n\
						Eres responsable de todas las actividades que ocurran bajo tu cuenta. Aceptas notificarnos inmediatamente cualquier uso no autorizado de tu cuenta o cualquier otra violación de seguridad.\n\
						3.3 Terminación de la cuenta\n\
						Nos reservamos el derecho de suspender o cancelar tu cuenta si determinamos que has violado estos Términos de Servicio o has incurrido en conductas ilegales o perjudiciales.\n\n",
					terms_4: "4. Autenticación\n\
						4.1 OAuth 2.0\n\
						El Servicio admite autenticación mediante Google OAuth 2.0 y 42 School OAuth 2.0. Al utilizar autenticación OAuth, nos otorgas permiso para acceder a la información de esos servicios según lo indicado en los avisos de autorización.\n\
						4.2 Autenticación en dos factores\n\
						Recomendamos encarecidamente activar la autenticación en dos factores (2FA) para mejorar la seguridad. Eres responsable de gestionar y proteger tus credenciales de 2FA (códigos TOTP).\n\n",
					terms_5: "5. Contenido del usuario\n\
						5.1 Propiedad del contenido\n\
						Conservas todos los derechos sobre el contenido que creas y subes al Servicio (\"Tu contenido\"). Al subir contenido, nos concedes una licencia mundial, no exclusiva y libre de regalías para usar, copiar, modificar y mostrar Tu contenido con el fin de operar y mejorar el Servicio.\n\
						5.2 Normas de contenido\n\
						Tu contenido no debe violar ninguna ley o regulación aplicable, infringir derechos de propiedad intelectual de terceros, contener material difamatorio, obsceno, ofensivo o perjudicial, constituir spam o promoción no solicitada, ni incluir información personal de terceros sin su consentimiento.\n\
						5.3 Moderación\n\
						Nos reservamos el derecho de eliminar, editar o rechazar la publicación de cualquier contenido que infrinja estos Términos de Servicio o las leyes aplicables.\n\n",
					terms_6: "6. Lienzo y funciones colaborativas\n\
						6.1 Compartir lienzos\n\
						Cuando compartes un lienzo con otros usuarios, estos obtienen los derechos de acceso que determines. Eres responsable de gestionar los permisos del lienzo.\n\
						6.2 Responsabilidad colaborativa\n\
						Los usuarios que colaboran en un lienzo aceptan respetar los derechos de propiedad intelectual y no utilizar las funciones colaborativas para acoso o abuso.\n\
						6.3 Datos del lienzo\n\
						Los lienzos y los datos asociados pueden almacenarse en nuestros servidores. Aunque implementamos medidas de seguridad, no somos responsables de la pérdida de datos o accesos no autorizados.\n\n",
					terms_7: "7. Comunicaciones y chat\n\
						7.1 Privacidad de los mensajes\n\
						Los mensajes privados entre usuarios están destinados a ser privados. Sin embargo, podemos acceder a ellos por motivos de seguridad, legales o de prevención de abusos.\n\
						7.2 Registros de conversación\n\
						Las conversaciones pueden almacenarse temporalmente en nuestros servidores para la prestación del servicio. Puedes eliminarlas en cualquier momento.\n\
						7.3 Bloqueo y denuncias\n\
						Puedes bloquear a otros usuarios para impedir que se pongan en contacto contigo. Si experimentas acoso o abuso, puedes reportar usuarios a nuestro equipo de moderación.\n\n",
					terms_8: "8. Limitación de responsabilidad\n\
						8.1 Exclusión de daños indirectos\n\
						En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos, ni de la pérdida de beneficios, ingresos, datos u oportunidades de negocio.\n\
						8.2 Límite de responsabilidad\n\
						Nuestra responsabilidad total frente a ti por cualquier reclamación derivada de estos Términos de Servicio no excederá de 100 dólares estadounidenses ($100) o de las cantidades que nos hayas pagado en los 12 meses anteriores a la reclamación, lo que sea mayor.\n\n",
					terms_9: "9. Conducta del usuario\n\
						Aceptas utilizar el Servicio únicamente con fines legales y de manera que no infrinja los derechos de otros. Las conductas prohibidas incluyen acosar o amenazar a otros usuarios, intentar accesos no autorizados, recopilar información personal sin consentimiento y violar leyes aplicables.\n\n",
					terms_10: "10. Resolución de disputas\n\
						10.1 Legislación aplicable\n\
						Estos Términos de Servicio se rigen e interpretan de acuerdo con las leyes de Francia, sin tener en cuenta sus principios de conflicto de leyes.\n\
						10.2 Resolución informal\n\
						Antes de recurrir a procedimientos formales, aceptas intentar resolver cualquier disputa de manera informal contactándonos.\n\n",
					terms_11: "11. Terminación\n\
						11.1 Terminación por tu parte\n\
						Puedes cancelar tu cuenta en cualquier momento contactándonos o utilizando la configuración de la cuenta.\n\
						11.2 Terminación por nuestra parte\n\
						Podemos suspender o cancelar tu acceso al Servicio de forma inmediata si determinamos que has infringido estos Términos de Servicio o has incurrido en conductas ilegales o perjudiciales.\n\n",
					terms_12: "12. Información de contacto\n\
						Para preguntas sobre estos Términos de Servicio, contáctanos en: Email: legal@transcendence.local. Dirección: Transcendence Services, 42 School, París, Francia.\n\n",
					terms_13: "13. Acuerdo completo\n\
						Estos Términos de Servicio, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre tú y nosotros en relación con el Servicio.\n\n",
					terms_14: "AL UTILIZAR EL SERVICIO, RECONOCES QUE HAS LEÍDO ESTOS TÉRMINOS DE SERVICIO, LOS ENTIENDES Y ACEPTAS QUEDAR VINCULADO POR ELLOS.\n\n",
			},
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