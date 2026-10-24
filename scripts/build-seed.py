# Generates data/menu.json (seed menu transcribed from the printed Pastalia menu).
import json, pathlib

def it(id, tr, en, dtr='', den='', kcal=None, al=(), **kw):
    d = {'id': id, 'name': {'tr': tr, 'en': en}, 'desc': {'tr': dtr, 'en': den}, 'kcal': kcal,
         'allergens': list(al), 'price': None, 'img': f'/assets/menu/{id}.webp', 'credit': '',
         'badge': {'tr': '', 'en': ''}, 'featured': False, 'available': True, 'hidden': False}
    d.update(kw)
    return d

cats = []
def cat(id, tr, en, ntr='', nen='', layout='cards', items=()):
    cats.append({'id': id, 'name': {'tr': tr, 'en': en}, 'note': {'tr': ntr, 'en': nen}, 'layout': layout, 'items': list(items)})

TS, MP = 'Domates sos', 'Tomato sauce'
cat('pizzalar', 'Pizzalar', 'Pizzas', 'Klasik ve ince hamurlu pizzalar', 'Classic thin-crust pizzas', items=[
  it('margherita', 'Margherita', 'Margherita', 'Domates sos, mozzarella peyniri', 'Tomato sauce, mozzarella', 770, ['milk','gluten'], featured=True),
  it('dana-kaburgali', 'Dana Kaburgalı', 'Smoked Beef Rib', 'Domates sos, mozzarella peyniri, füme dana kaburga, mantar', 'Tomato sauce, mozzarella, smoked beef rib, mushrooms', 990, ['milk','gluten']),
  it('lia-pesto', 'Lia Pesto', 'Lia Pesto', 'Domates sos, mozzarella peyniri, krema, pesto sos', 'Tomato sauce, mozzarella, cream, pesto sauce', 950, ['milk','nuts','gluten'], badge={'tr':'İmza','en':'Signature'}),
  it('karisik', 'Karışık', 'Mixed', 'Domates sos, mozzarella peyniri, sucuk, mısır, mantar, kapya biber, zeytin', 'Tomato sauce, mozzarella, sucuk (Turkish beef sausage), corn, mushrooms, kapia pepper, olives', 1010, ['milk','gluten']),
  it('dort-peynirli', 'Dört Peynirli', 'Four Cheese', 'Domates sos, mozzarella peyniri, Ezine peyniri, baby mozzarella, parmesan', 'Tomato sauce, mozzarella, Ezine white cheese, baby mozzarella, parmesan', 980, ['milk','gluten']),
  it('sucuklu', 'Sucuklu', 'Sucuk', 'Domates sos, mozzarella peyniri, dana sucuk', 'Tomato sauce, mozzarella, beef sucuk (Turkish sausage)', 1020, ['milk','gluten']),
  it('mantarli', 'Mantarlı', 'Mushroom', 'Domates sos, mozzarella, kültür mantarı', 'Tomato sauce, mozzarella, button mushrooms', 790, ['milk','gluten']),
  it('kavurmali', 'Kavurmalı', 'Beef Kavurma', 'Domates sos, mozzarella peyniri, kırmızı soğan, mantar, dana kavurma', 'Tomato sauce, mozzarella, red onion, mushrooms, slow-cooked beef kavurma', 970, ['milk','gluten']),
  it('lia-ton', 'Lia Ton', 'Lia Tuna', 'Domates sos, mozzarella peyniri, ton balığı, soğan, kapya biber', 'Tomato sauce, mozzarella, tuna, onion, kapia pepper', 855, ['milk','fish','gluten']),
  it('karisik-etli', 'Karışık Etli', 'Mixed Meat', 'Domates sos, mozzarella peyniri, füme dana kaburga, dana kavurma', 'Tomato sauce, mozzarella, smoked beef rib, beef kavurma', 1200, ['milk','gluten']),
])
cat('makarnalar', 'Makarnalar', 'Pasta', 'El açması taze fettuccine', 'Hand-rolled fresh fettuccine', items=[
  it('fettuccine-200', 'Fettuccine 200 gr', 'Fettuccine 200 g', 'Krema ve parmesan peynirli', 'With cream and parmesan', 421, ['gluten','egg','milk'], img='/assets/menu/fettuccine.webp'),
  it('fettuccine-250', 'Fettuccine 250 gr', 'Fettuccine 250 g', 'Krema ve parmesan peynirli', 'With cream and parmesan', 520, ['gluten','egg','milk'], img='/assets/menu/fettuccine.webp', featured=True),
  it('fettuccine-300', 'Fettuccine 300 gr', 'Fettuccine 300 g', 'Krema ve parmesan peynirli', 'With cream and parmesan', 620, ['gluten','egg','milk'], img='/assets/menu/fettuccine.webp'),
])
cat('makarna-eklemeleri', 'Makarna Eklemeleri', 'Pasta Add-ons', 'Makarnanızı dilediğiniz gibi zenginleştirin', 'Make your pasta your own', 'list', items=[
  it('napoliten-sos', 'Napoliten Sos', 'Napoletana Sauce', 'Domatesli klasik İtalyan sosu', 'Classic Italian tomato sauce'),
  it('arabiata-sos', 'Arabiata Sos', 'Arrabbiata Sauce', 'Acılı domates sosu', 'Spicy tomato sauce'),
  it('sweet-chili-sos', 'Sweet Chili Sos', 'Sweet Chili Sauce', 'Tatlı-acı sos', 'Sweet & spicy sauce'),
  it('pesto-kurutulmus-domates', 'Pesto Kurutulmuş Domatesli', 'Pesto & Sun-dried Tomato', '', '', None, ['peanut']),
  it('baby-mozzarella', 'Baby Mozzarella', 'Baby Mozzarella', '', '', None, ['milk']),
  it('mantar', 'Mantar', 'Mushrooms'),
  it('kori-soslu-tavuk', 'Köri Soslu Tavuk', 'Curry Chicken'),
  it('sade-tavuk', 'Sade Tavuk', 'Plain Chicken'),
  it('ton-balik', 'Ton Balık', 'Tuna', '', '', None, ['fish']),
  it('kitir-sogan', 'Kıtır Soğan', 'Crispy Onions'),
  it('ekstra-parmesan', 'Ekstra Parmesan', 'Extra Parmesan', '', '', None, ['milk']),
  it('misir', 'Mısır', 'Corn'),
])
cat('pasta-bowl', 'Pasta Bowl', 'Pasta Bowls', 'Taze makarna ve taze sebzelerle', 'Fresh pasta with fresh vegetables', items=[
  it('lia-ton-bowl', 'Lia Ton Bowl', 'Lia Tuna Bowl', 'Makarna, ton balığı, kıtır soğan, mor lahana turşusu, rende havuç, mısır', 'Pasta, tuna, crispy onions, pickled red cabbage, grated carrot, corn', 445, ['fish','gluten','egg']),
  it('tavuklu-bowl', 'Tavuklu Bowl', 'Chicken Bowl', 'Makarna, tavuk, marul, mor lahana turşusu, rende havuç, mısır', 'Pasta, chicken, lettuce, pickled red cabbage, grated carrot, corn', 530, ['gluten','egg'], featured=True),
  it('peynirli-bowl', 'Peynirli Bowl', 'Cheese Bowl', 'Makarna, Ezine peyniri, baby mozzarella, parmesan, marul, mor lahana turşusu, roka', 'Pasta, Ezine white cheese, baby mozzarella, parmesan, lettuce, pickled red cabbage, rocket', 490, ['milk','gluten','egg']),
  it('balli-hardalli-bowl', 'Ballı Hardallı Bowl', 'Honey Mustard Bowl', 'Makarna, ballı hardal soslu tavuk, marul, ceviz, roka, mor lahana turşusu, rende havuç', 'Pasta, honey-mustard chicken, lettuce, walnuts, rocket, pickled red cabbage, grated carrot', 650, ['mustard','nuts','gluten','egg']),
  it('aci-tavuklu-bowl', 'Acı Tavuklu Bowl', 'Spicy Chicken Bowl', 'Makarna, acılı tavuk, marul, mor lahana turşusu, mısır, turşu biber, rende havuç', 'Pasta, spicy chicken, lettuce, pickled red cabbage, corn, pickled peppers, grated carrot', 560, ['gluten','egg']),
  it('zerdecalli-bowl', 'Zerdeçallı Bowl', 'Turmeric Bowl', 'Zerdeçallı makarna, tavuk, mor lahana turşusu, mısır, rende havuç, marul', 'Turmeric pasta, chicken, pickled red cabbage, corn, grated carrot, lettuce', 540, ['gluten','egg']),
])
cat('sandvicler', 'Sandviçler', 'Sandwiches', '', '', items=[
  it('dana-jambon', 'Dana Jambon', 'Beef Ham', 'Dana jambon, mozzarella, marul, trüf mayonez, zeytinyağı', 'Beef ham, mozzarella, lettuce, truffle mayo, olive oil', 850, ['milk','gluten']),
  it('pesto-peynir', 'Pesto Peynir', 'Pesto & Cheese', 'Pesto, mozzarella, Ezine peyniri, roka, siyah zeytin, zeytinyağı', 'Pesto, mozzarella, Ezine white cheese, rocket, black olives, olive oil', 900, ['milk','nuts','gluten']),
  it('avokado-yumurta', 'Avokado Yumurta', 'Avocado & Egg', 'Avokado, çırpılmış yumurta, mozzarella, roka, zeytinyağı', 'Avocado, scrambled eggs, mozzarella, rocket, olive oil', 918, ['milk','gluten','egg']),
  it('citir-tavuk', 'Çıtır Tavuk', 'Crispy Chicken', 'Çıtır tavuk, marul, trüf mayonez, mor lahana turşusu, zeytinyağı', 'Crispy chicken, lettuce, truffle mayo, pickled red cabbage, olive oil', 980, ['gluten']),
  it('balli-hardalli-citir', 'Ballı Hardallı Çıtır', 'Honey Mustard Crispy Chicken', 'Ballı hardal, çıtır tavuk, marul, rende havuç, zeytinyağı', 'Honey mustard, crispy chicken, lettuce, grated carrot, olive oil', 1030, ['mustard','gluten']),
  it('dana-fume-kaburga', 'Dana Füme Kaburga', 'Smoked Beef Rib', 'Füme dana kaburga, mozzarella, marul, trüf mayonez, mor lahana turşusu, zeytinyağı', 'Smoked beef rib, mozzarella, lettuce, truffle mayo, pickled red cabbage, olive oil', 970, ['milk','gluten']),
])
cat('salatalar', 'Salatalar', 'Salads', '', '', items=[
  it('yesillik-salata', 'Yeşillik Salata', 'Green Salad', 'Marul, roka, mısır, mor lahana turşusu, rende havuç', 'Lettuce, rocket, corn, pickled red cabbage, grated carrot', 125, []),
  it('tavuklu-salata', 'Tavuklu Salata', 'Chicken Salad', 'Izgara tavuk, marul, roka, rende havuç, mısır, mor lahana turşusu, ceviz', 'Grilled chicken, lettuce, rocket, grated carrot, corn, pickled red cabbage, walnuts', 490, ['nuts']),
  it('ton-balikli-salata', 'Ton Balıklı Salata', 'Tuna Salad', 'Ton balığı, marul, roka, mısır, kıtır soğan', 'Tuna, lettuce, rocket, corn, crispy onions', 305, ['fish']),
])
cat('tatlilar', 'Tatlılar', 'Desserts', '', '', items=[
  it('klasik-tiramisu', 'Klasik İtalyan Tiramisu', 'Classic Italian Tiramisu', 'Mascarpone peynirli orijinal İtalyan tiramisu, kakaolu olarak servis edilir.', 'Original Italian tiramisu with mascarpone, served dusted with cocoa.', 500, ['milk','egg'], featured=True),
  it('belcika-cikolatali-tiramisu', 'Belçika Çikolatalı Tiramisu', 'Belgian Chocolate Tiramisu', 'Mascarpone peynirli, Belçika çikolatalı orijinal İtalyan tiramisu, kakaolu olarak servis edilir.', 'Original Italian tiramisu with mascarpone and Belgian chocolate, served dusted with cocoa.', 580, ['milk','egg'], badge={'tr':'Yeni','en':'New'}),
  it('limonlu-tiramisu', 'Limonlu Tiramisu', 'Lemon Tiramisu', 'Hafif ekşimsi, ferah; yaza özel bir lezzet.', 'Light, tangy and refreshing: a summer special.', None, ['milk','egg'], hidden=True),
])
cat('soguk-icecekler', 'Soğuk İçecekler', 'Cold Drinks', '', '', items=[
  it('coca-cola', 'Coca-Cola / Zero', 'Coca-Cola / Zero', 'Klasik veya Zero', 'Classic or Zero'),
  it('fuse-tea', 'Fuse Tea', 'Fuse Tea', 'Limon / Şeftali / Ananas-Mango', 'Lemon / Peach / Pineapple-Mango'),
  it('uludag-gazoz', 'Uludağ Gazoz', 'Uludağ Soda Pop', 'Sade / Portakallı', 'Original / Orange'),
  it('uludag-limonata', 'Uludağ Limonata', 'Uludağ Lemonade'),
  it('churchill', 'Churchill', 'Churchill', 'Soda, taze limon ve tuz', 'Sparkling water with fresh lemon and a pinch of salt'),
  it('ayran', 'Ayran', 'Ayran', 'Geleneksel yoğurt içeceği', 'Traditional salted yogurt drink', None, ['milk']),
  it('soda', 'Soda', 'Sparkling Mineral Water', 'Maden suyu', 'Turkish mineral water'),
  it('su', 'Su', 'Still Water'),
])
cat('sicak-icecekler', 'Sıcak İçecekler', 'Hot Drinks', '', '', items=[
  it('turk-kahvesi', 'Türk Kahvesi', 'Turkish Coffee'),
  it('salep', 'Salep', 'Salep', 'Tarçınlı sıcak süt içeceği', 'Hot milk drink with cinnamon', None, ['milk']),
  it('cay', 'Çay', 'Turkish Tea', 'İnce belli bardakta demli çay', 'Brewed black tea in a tulip glass'),
])

items = []
categories = []
for c in cats:
    for i in c.pop('items'):
        i['cat'] = c['id']
        items.append(i)
    categories.append(c)

settings = {
  'name': 'Pastalia',
  'subtitle': {'tr': 'Pizza & Makarna', 'en': 'Pizza & Pasta'},
  'tagline': {'tr': 'İnce hamurlu pizzalar, el açması taze makarna ve İtalyan tiramisu.', 'en': 'Thin-crust pizzas, hand-rolled fresh pasta and Italian tiramisu.'},
  'hours': {'tr': 'Her gün 11:00 – 22:00', 'en': 'Every day 11:00 – 22:00'},
  'orderNote': {'tr': 'Siparişlerinizi içeri veriniz', 'en': 'Please place your orders inside'},
  'allergenNote': {'tr': 'Alerjen hassasiyetiniz varsa lütfen bildiriniz.', 'en': 'Please let us know if you have any food allergies.'},
  'city': 'Milas, Muğla',
  'address': '',
  'phone': '',
  'instagram': 'pastaliamilas',
  'mapsUrl': '',
  'currency': '₺',
  'mealCards': 'Setcard, Metropol Card, Multinet, Ticket Restaurant, Edenred',
  'delivery': 'Yemeksepeti, Trendyol Go, Getir Yemek, Migros Yemek',
}
menu = {'version': 2, 'settings': settings, 'categories': categories, 'items': items}
p = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'menu.json'
p.write_text(json.dumps(menu, ensure_ascii=False, indent=1))
print(len(categories), 'categories', len(items), 'items')
