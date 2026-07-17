import type { Dictionary } from './en';

/** Arabic UI strings — written natively (MSA, light Gulf tone), SPEC §2.4. */
export const ar: Dictionary = {
  nav: {
    home: 'الرئيسية',
    about: 'من نحن',
    services: 'خدماتنا',
    contact: 'تواصل معنا',
    menuOpen: 'افتح القائمة',
    menuClose: 'أغلق القائمة',
    langSwitch: 'Switch to English',
    langLabel: 'EN',
  },
  cta: {
    whatsapp: 'كلمنا على الواتساب',
    exploreServices: 'استكشف خدماتنا',
    contactUs: 'تواصل معنا',
    aboutLink: 'اعرف عنا أكثر',
    whatsappFloat: 'تواصل مع بيراميديا إكس على الواتساب',
  },
  ctaBand: {
    title: 'جاهزين لما تكون جاهز.',
  },
  footer: {
    navigate: 'التصفح',
    services: 'خدماتنا',
    contact: 'التواصل',
    follow: 'تابعنا',
    rights: 'جميع الحقوق محفوظة.',
  },
  form: {
    name: 'الاسم',
    phone: 'رقم الهاتف',
    phoneHint: 'بالصيغة الدولية، مثال: +971 5X XXX XXXX',
    email: 'البريد الإلكتروني',
    company: 'اسم الشركة',
    service: 'الخدمة المطلوبة',
    serviceGeneral: 'استفسار عام',
    message: 'رسالتك',
    optional: 'اختياري',
    send: 'أرسل الرسالة',
    sending: 'جارٍ الإرسال…',
    errRequired: 'هذا الحقل مطلوب.',
    errPhone: 'أدخل رقم هاتف صحيحاً.',
    errEmail: 'أدخل بريداً إلكترونياً صحيحاً.',
    successTitle: 'شكراً لك — وصلتنا رسالتك.',
    successBody: 'سنتواصل معك قريباً. وإذا تبغى رداً أسرع، كلمنا على الواتساب.',
    errorTitle: 'صار خلل أثناء الإرسال.',
    errorBody: 'حاول مرة ثانية، أو كلمنا مباشرة على الواتساب.',
    retry: 'حاول مرة أخرى',
    disabledNotice: 'النموذج قيد التفعيل حالياً — كلمنا على الواتساب، وبنرد عليك بسرعة.',
  },
  consent: {
    text: 'نستخدم ملفات تعريف ارتباط تحليلية لنفهم كيف يتصفح الزوار الموقع. لا يعمل أي تتبّع إلا بعد موافقتك.',
    accept: 'أوافق',
    decline: 'أرفض',
  },
  service: {
    included: 'ماذا تشمل الخدمة',
    process: 'كيف نشتغل عليها',
    tools: 'أدوات نعمل بها',
    faq: 'أسئلة شائعة',
    all: 'كل الخدمات',
  },
  a11y: {
    skipLink: 'تخطَّ إلى المحتوى',
    breadcrumb: 'مسار التنقل',
  },
  founder: {
    name: 'محمد عبده',
    title: 'المؤسس والرئيس التنفيذي',
  },
  notFound: {
    title: 'الصفحة غير موجودة.',
    body: 'الصفحة اللي تدور عليها غير موجودة أو تم نقلها.',
    back: 'العودة إلى الرئيسية',
  },
};
