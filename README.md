# Blood Bank Inventory (React Native + Appwrite)

تطبيق اندرويد بسيط لإدارة المخزون لمركز نقل الدم بالإسماعيلية.

الملامح:
- اضافة الأصناف
- اضافة مخزون (تاريخ، اسم الصنف، العدد، الوحدة، LOT، Expire Date، ملاحظات)
- صرف للمحافظات (سجل صرف)
- مرتجعات
- ربط مع Appwrite (قاعدة بيانات)
- تنبيهات محلية قبل 30 يوم من تاريخ الانتهاء باستخدام `expo-notifications`

متطلبات:
- تثبيت Node.js
- تثبيت Expo CLI: `npm install -g expo-cli`
- حساب Appwrite وتهيئة: إنشاء `database` ومجموعات `items`, `stock`, `consumes`, `returns` والحصول على `PROJECT_ID` وبدء خادم Appwrite مع endpoint
- استبدال القيم مكان `[...]` في `src/appwrite.js`

تشغيل:

```bash
npm install
expo start
# ثم ربط الجهاز أو المحاكي لتشغيل Android
```

ملاحظات تنفيذية:
- يجب إعداد Google OAuth في Appwrite console أو استخدام `expo-auth-session` لجلب بيانات المستخدم. حالياً الكود يترك مكان الربط لتخصيصك.
- تهيئة الاشعارات تتطلب بعض خطوات على Android (إعطاء صلاحيات)، راجع توثيق `expo-notifications`.

Google Sign-In و Appwrite:
- لتفعيل تسجيل الدخول بـ Google قم بإنشاء OAuth client في Google Cloud Console واحصل على `CLIENT_ID` ثم استبدل `<YOUR_GOOGLE_CLIENT_ID>` في `src/screens/Auth.js`.
- في Appwrite Console يمكنك تفعيل مزود Google OAuth داخل إعدادات المشروع (OAuth2) وإعداد Redirect URI. على الأجهزة المحمولة اختبر باستخدام Expo proxy (`AuthSession.makeRedirectUri({ useProxy: true })`).
- التطبيق يحاول إضافة سجل مستخدم إلى مجموعة `users` (أنشئ مجموعة `users` في قاعدة البيانات `DATABASE_ID`). إذا كانت صلاحيات المجموعة تمنع الكتابة من دون مصادقة، فستحتاج لتعديل قواعد الأذونات أو استخدام وظائف backend.

تحديثات سريعة في المشروع:
- تم اضافة شاشة `Auth` لتسجيل الدخول بحساب Google: [src/screens/Auth.js](src/screens/Auth.js)
- تم اضافة مساعد الاشعارات: [src/notifications.js](src/notifications.js)
- افحص وحدث `src/appwrite.js` بمعلومات `endpoint`, `PROJECT_ID`, و`DATABASE_ID`.

تشغيل:

```bash
npm install
expo start
```

Install optional UI deps (recommended):

```bash
npm install react-native-paper @react-native-community/datetimepicker
```

Appwrite server flow (اقتراح ونموذج):
- تستخدم Appwrite Functions أو خادم وسيط للتحقق من Google ID token وإضافة/الربط بقاعدة Appwrite بأمان.
- مثال وظيفي موجود في `functions/link-google/index.js` يقوم بالتحقق من `idToken` عبر Google Auth Library، ثم ينشئ/يبحث عن المستخدم في مجموعة `users` في Appwrite باستخدام مفتاح API للمشروع.
- نشر الوظيفة: ارفع محتويات `functions/link-google` إلى Appwrite Functions (runtime: Node.js)، اضبط المتغيرات البيئية: `GOOGLE_CLIENT_ID`, `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT`, `APPWRITE_KEY`, `DATABASE_ID`, `USERS_COLLECTION_ID`.
- من التطبيق المحمول: بعد الحصول على Google `idToken` باستخدام `expo-auth-session`, أرسل طلب POST إلى endpoint الوظيفة مع `{ idToken }`. الوظيفة ستعيد سجل المستخدم.

ملاحظات أمنية:
- لا تضع `APPWRITE_KEY` في تطبيق الموبايل. خزنها كمتغير بيئي داخل وظيفة Appwrite أو خادم آمن.
- اضبط أذونات مجموعة `users` بحيث تسمح للوظيفة بإنشاء المستندات دون جعل المجموعة عامة.

مزيد من العمل المقترح:
- تحسين واجهة المستخدم باستخدام مكتبة UI مثل `react-native-paper`.
- اضافة فلترة وعرض تفاصيل المخزون وكمية متبقية وحسابات تلقائية عند الصرف/العودة.
