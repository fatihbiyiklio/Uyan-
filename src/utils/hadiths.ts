export const HADITHS = [
    { source: "Buhârî, Îmân 1", text: "Ameller niyetlere göredir. Herkes sadece niyet ettiğinin karşılığını alır." },
    { source: "Müslim, Îmân 106", text: "Din kolaylıktır. Dini aşmak isteyen kimse, ona yenik düşer. O halde orta yolu tutun, en iyiyi yapmaya çalışın." },
    { source: "Buhârî, Edeb 18", text: "Sizin en hayırlınız, ahlakı en güzel olanınızdır." },
    { source: "Tirmizî, Zühd 11", text: "Tebessüm sadakadır." },
    { source: "Buhârî, Savm 9", text: "Oruç bir kalkandır." },
    { source: "Müslim, Sıyâm 163", text: "Ramazan ayı girdiğinde cennet kapıları açılır, cehennem kapıları kapanır ve şeytanlar zincire vurulur." },
    { source: "Buhârî, Bed’ü’l-vahy 1", text: "Kolaylaştırınız, güçleştirmeyiniz; müjdeleyiniz, nefret ettirmeyiniz." },
    { source: "Müslim, Birr 103", text: "Mümin, bir delikten iki defa ısırılmaz (aynı hataya iki kez düşmez)." },
    { source: "Buhârî, Rikâk 10", text: "İki nimet vardır ki insanların çoğu onların kıymetini bilmez: Sağlık ve boş vakit." },
    { source: "Tirmizî, Birr 55", text: "Merhamet etmeyene merhamet olunmaz." },
    { source: "İbn Mâce, Mukaddime 9", text: "Temizlik imanın yarısıdır." },
    { source: "Buhârî, İstikraz 2", text: "Veren el, alan elden üstündür." },
];

export function getDailyHadith() {
    // Use the day of the year to pick a hadith, so it rotates daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return HADITHS[dayOfYear % HADITHS.length];
}
