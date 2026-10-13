// Regenerates server/data/products.json with the demonstration catalogue.
// Replace the rows below (or edit the JSON directly) with the real stock list.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const photo = (id) => `https://images.unsplash.com/photo-${id}`;
const ALL = ['akwa', 'kadji', 'yaounde'];

const SIZES = {
  shoeM: ['40', '41', '42', '43', '44', '45'],
  shoeW: ['36', '37', '38', '39', '40', '41'],
  shoeU: ['38', '39', '40', '41', '42', '43', '44'],
  shoeK: ['28', '30', '32', '33', '34', '35'],
  top: ['S', 'M', 'L', 'XL', 'XXL'],
  topW: ['XS', 'S', 'M', 'L', 'XL'],
  kid: ['4 ans', '6 ans', '8 ans', '10 ans', '12 ans'],
  jean: ['30', '31', '32', '33', '34', '36'],
  one: ['TU'],
};

// slug, brand, [name fr, name en], category, [type fr, type en], gender, price,
// compareAt, sizes, photo id, isNew, [description fr, description en]
const rows = [
  ['nike-running-rouge', 'Nike', ['Chaussure de running rouge', 'Red running shoe'], 'chaussures', ['Running', 'Running'], 'homme', 62000, null, SIZES.shoeM, '1542291026-7eec264c27ff', true,
    ['Tige en maille respirante et semelle souple pour les sorties sur route.', 'Breathable knit upper and a flexible sole for road runs.']],
  ['nike-training-fluo', 'Nike', ['Chaussure de training jaune fluo', 'Volt yellow training shoe'], 'chaussures', ['Training', 'Training'], 'mixte', 58000, null, SIZES.shoeU, '1606107557195-0e29a4b5b4aa', false,
    ['Stable et légère pour la salle, le circuit training et le cardio.', 'Stable and light for the gym, circuits and cardio.']],
  ['nike-basse-pastel', 'Nike', ['Basket basse pastel', 'Pastel low-top sneaker'], 'chaussures', ['Lifestyle', 'Lifestyle'], 'femme', 75000, null, SIZES.shoeW, '1595950653106-6c9ebd614d3a', true,
    ['Une silhouette de basket classique, en couleurs douces.', 'A classic court silhouette in soft colours.']],
  ['nike-air-blanc-orange', 'Nike', ["Basket à bulle d'air blanche et orange", 'White and orange air-sole sneaker'], 'chaussures', ['Lifestyle', 'Lifestyle'], 'homme', 85000, 98000, SIZES.shoeM, '1600185365926-3a2ce3cdb9eb', false,
    ['Amorti visible au talon et touches orange pour le quotidien.', 'Visible heel cushioning with orange accents for everyday wear.']],
  ['nike-cuir-blanc', 'Nike', ['Basket basse en cuir blanc', 'White leather low-top'], 'chaussures', ['Lifestyle', 'Lifestyle'], 'mixte', 70000, null, SIZES.shoeU, '1600269452121-4f2416e55c28', true,
    ['Le cuir blanc qui va avec tout, du jean au survêtement.', 'White leather that goes with everything, from jeans to tracksuits.']],
  ['nike-cuir-noir', 'Nike', ['Basket basse en cuir noir', 'Black leather low-top'], 'chaussures', ['Lifestyle', 'Lifestyle'], 'homme', 70000, null, SIZES.shoeM, '1543508282-6319a3e2621f', false,
    ['La même silhouette, en noir et blanc.', 'The same silhouette, in black and white.']],
  ['new-balance-retro-olive', 'New Balance', ['Basket rétro olive', 'Olive retro runner'], 'chaussures', ['Lifestyle', 'Lifestyle'], 'homme', 68000, null, SIZES.shoeM, '1539185441755-769473a23570', false,
    ['Daim et maille dans un ton olive, sur semelle running rétro.', 'Suede and mesh in olive on a retro running sole.']],
  ['new-balance-retro-rose', 'New Balance', ['Basket rétro rose', 'Pink retro runner'], 'chaussures', ['Lifestyle', 'Lifestyle'], 'femme', 68000, 79000, SIZES.shoeW, '1551107696-a4b0c5a0d9a2', false,
    ['Un rose poudré sur une coupe running des années 80.', 'Powder pink on an eighties running shape.']],
  ['nike-basketball-grise', 'Nike', ['Chaussure de basketball grise', 'Grey basketball shoe'], 'chaussures', ['Basketball', 'Basketball'], 'homme', 72000, null, SIZES.shoeM, '1605348532760-6753d2c43329', false,
    ['Maintien de la cheville et accroche pour le parquet comme le bitume.', 'Ankle support and grip for indoor and outdoor courts.']],
  ['jordan-montante-rouge', 'Jordan', ['Basket montante rouge', 'Red high-top sneaker'], 'chaussures', ['Basketball', 'Basketball'], 'homme', 120000, null, SIZES.shoeM, '1575537302964-96cd47c06b1b', true,
    ['Montante rouge intégrale, née sur les parquets.', 'An all-red high-top with basketball roots.']],
  ['nike-junior-rose', 'Nike', ['Basket junior rose et blanche', "Kids' pink and white sneaker"], 'chaussures', ['Lifestyle', 'Lifestyle'], 'enfant', 45000, null, SIZES.shoeK, '1511556532299-8f662fc26c06', false,
    ["Amorti à bulle d'air, version petites pointures.", 'Air-sole cushioning in smaller sizes.']],
  ['nike-junior-bleue', 'Nike', ['Basket junior bleu électrique', "Kids' electric blue sneaker"], 'chaussures', ['Lifestyle', 'Lifestyle'], 'enfant', 42000, 52000, SIZES.shoeK, '1515955656352-a1fa3ffcd111', false,
    ['Pour la cour de récré comme pour le sport.', 'For the playground and for sport.']],

  ['sweat-capuche-gris', 'Puma', ['Sweat à capuche gris', 'Grey hoodie'], 'vetements', ['Sweat', 'Hoodie'], 'homme', 28000, null, SIZES.top, '1556821840-3a63f95609a7', false,
    ['Molleton épais, capuche doublée et poche kangourou.', 'Heavy fleece, lined hood and kangaroo pocket.']],
  ['tshirt-coton-blanc', 'Adidas', ['T-shirt blanc en coton', 'White cotton t-shirt'], 'vetements', ['T-shirt', 'T-shirt'], 'homme', 12000, null, SIZES.top, '1521572163474-6864f9cf17ab', false,
    ['Le basique en coton, coupe droite.', 'The cotton basic, straight cut.']],
  ['tshirt-noir-essentiel', 'Puma', ['T-shirt noir essentiel', 'Essential black t-shirt'], 'vetements', ['T-shirt', 'T-shirt'], 'mixte', 12000, null, SIZES.top, '1618354691373-d851c5c3a990', false,
    ['Jersey de coton noir et petit logo poitrine.', 'Black cotton jersey with a small chest logo.']],
  ['bomber-brique', 'Tommy Hilfiger', ['Bomber couleur brique', 'Brick bomber jacket'], 'vetements', ['Veste', 'Jacket'], 'homme', 45000, 55000, SIZES.top, '1591047139829-d91aecb6caea', false,
    ['Veste zippée légère, bords-côtes aux poignets et à la taille.', 'A light zip jacket with ribbed cuffs and hem.']],
  ['sweat-col-rond-blanc', 'New Balance', ['Sweat col rond blanc', 'White crewneck sweatshirt'], 'vetements', ['Sweat', 'Sweatshirt'], 'mixte', 25000, null, SIZES.top, '1620799140408-edc6dcb6d633', true,
    ['Un col rond tout simple, en molleton doux.', 'A plain crewneck in soft fleece.']],
  ['ensemble-survetement-jaune', 'Adidas', ['Ensemble survêtement jaune', 'Yellow tracksuit set'], 'vetements', ['Ensemble', 'Set'], 'femme', 48000, null, SIZES.topW, '1515886657613-9f3515b0c78f', true,
    ['Haut et pantalon assortis, pour le sport ou pour sortir.', 'Matching top and trousers, for training or going out.']],
  ['legging-sport-orange', 'Under Armour', ['Legging de sport orange', 'Orange training leggings'], 'vetements', ['Legging', 'Leggings'], 'femme', 22000, null, SIZES.topW, '1571019613454-1cb2f99b2d8b', false,
    ['Taille haute et tissu extensible qui suit le mouvement.', 'High waist and stretch fabric that moves with you.']],
  ['robe-rouge-fleurie', 'Ellesse', ['Robe rouge à fleurs', 'Red floral dress'], 'vetements', ['Robe', 'Dress'], 'femme', 32000, null, SIZES.topW, '1572804013309-59a88b7e92f1', true,
    ['Robe cintrée à volants, imprimé fleuri.', 'A fitted, ruffled dress in a floral print.']],
  ['robe-longue-rouge', 'Tommy Hilfiger', ['Robe longue rouge', 'Long red dress'], 'vetements', ['Robe', 'Dress'], 'femme', 38000, null, SIZES.topW, '1595777457583-95e059d581b8', false,
    ['Une robe longue et fluide pour les grandes occasions.', 'A long, flowing dress for special occasions.']],
  ['robe-legere-bleu-ciel', 'Ellesse', ['Robe légère bleu ciel', 'Light sky-blue dress'], 'vetements', ['Robe', 'Dress'], 'femme', 29000, 36000, SIZES.topW, '1539008835657-9e8e9680c956', false,
    ['Tissu léger et coupe portefeuille pour les journées chaudes.', 'Light fabric and a wrap cut for hot days.']],
  ['jean-brut-droit', "Levi's", ['Jean brut coupe droite', 'Dark straight-leg jeans'], 'vetements', ['Jean', 'Jeans'], 'homme', 42000, null, SIZES.jean, '1542272604-787c3835535d', false,
    ['Denim brut, cinq poches, coupe droite.', 'Raw denim, five pockets, straight leg.']],
  ['tshirt-enfant-blanc', 'Adidas', ['T-shirt enfant blanc', "Kids' white t-shirt"], 'vetements', ['T-shirt', 'T-shirt'], 'enfant', 8000, null, SIZES.kid, '1622290291468-a28f7a7dc6a8', false,
    ['Coton doux, facile à laver et à relaver.', 'Soft cotton that survives wash after wash.']],

  ['casquette-blanche', 'Puma', ['Casquette blanche', 'White cap'], 'accessoires', ['Casquette', 'Cap'], 'mixte', 9000, null, SIZES.one, '1588850561407-ed78c282e89b', false,
    ['Six panneaux, visière courbée et réglage au dos.', 'Six panels, curved peak and adjustable back.']],
  ['sac-a-dos-marine', 'Under Armour', ['Sac à dos bleu marine', 'Navy backpack'], 'accessoires', ['Sac', 'Bag'], 'mixte', 24000, null, SIZES.one, '1553062407-98eeb64c6a62', true,
    ["Un grand compartiment et une poche avant pour l'école, la salle ou le week-end.", 'One large compartment and a front pocket for school, the gym or a weekend away.']],
  ['gourde-isotherme-verte', 'Puma', ['Gourde isotherme verte', 'Green insulated bottle'], 'accessoires', ['Gourde', 'Bottle'], 'mixte', 9500, null, SIZES.one, '1602143407151-7111542de6e8', false,
    ["Garde l'eau fraîche pendant l'entraînement.", 'Keeps water cold through a training session.']],

  ['ballon-football-etoiles', 'Adidas', ['Ballon de football à étoiles', 'Star-print football'], 'equipement', ['Football', 'Football'], 'mixte', 18000, null, ['Taille 5'], '1614632537190-23e4146777db', true,
    ["Taille 5, pour l'entraînement et les matchs entre amis.", 'Size 5, for training and five-a-side with friends.']],
  ['ballon-basketball', 'Nike', ['Ballon de basketball', 'Basketball'], 'equipement', ['Basketball', 'Basketball'], 'mixte', 16000, null, ['Taille 7'], '1519861531473-9200262188bf', false,
    ['Revêtement adhérent pour le jeu en extérieur.', 'A grippy cover made for outdoor play.']],
  ['kit-natation', 'Nike', ['Lunettes et bonnet de natation', 'Swim goggles and cap'], 'equipement', ['Natation', 'Swimming'], 'mixte', 15000, 19000, SIZES.one, '1530549387789-4c1017266635', false,
    ['Le duo pour la piscine : lunettes anti-buée et bonnet en silicone.', 'The pool pair: anti-fog goggles and a silicone cap.']],
];

const products = rows.map(
  ([slug, brand, name, category, type, gender, price, compareAt, sizes, id, isNew, desc]) => ({
    slug,
    brand,
    name: { fr: name[0], en: name[1] },
    category,
    type: { fr: type[0], en: type[1] },
    gender,
    price,
    compareAt,
    sizes,
    image: photo(id),
    isNew,
    stores: ALL,
    description: { fr: desc[0], en: desc[1] },
  })
);

const out = fileURLToPath(new URL('../server/data/products.json', import.meta.url));
writeFileSync(out, JSON.stringify(products, null, 2) + '\n');
console.log(`${products.length} products written`);
