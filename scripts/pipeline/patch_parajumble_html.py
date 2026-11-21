import json

with open('public/data/aptitude/english/para-jumble.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for item in items:
    if item['uid'] == 'APT-ENG-3421':
        item['questionHtml'] = '<p><span>Parts of a sentence are given below in jumbled order. Select the option that arranges the parts in the correct order to form a meaningful sentence.</span></p>\r\n<p><span><strong>A.</strong> by conquest, rather than by economic contract</span></p>\r\n<p><span><strong>B.</strong> other types of feudalism was the relation</span></p>\r\n<p><span><strong>C.</strong> The principal difference between Indian and</span></p>\r\n<p><span><strong>D.</strong> between lord and vassal, established in this case</span></p>\n<ol style="list-style-type:upper-alpha"><li><p>B, D, A, C</p>\n</li><li><p>C, B, D, A</p>\n</li><li><p>B, A, D, C</p>\n</li><li><p>C, B, A, D</p>\n</li></ol>'
    elif item['uid'] == 'APT-ENG-3424':
        item['questionHtml'] = '<p><span>Parts of a sentence are given below in jumbled order. Select the option that arranges the parts in the correct order to form a meaningful sentence.</span></p>\r\n<p><span><strong>A.</strong> although many scholars believe that</span></p>\r\n<p><span><strong>B.</strong> no records of such a commission from Francesco exist,</span></p>\r\n<p><span><strong>C.</strong> the painting depicts Lisa Gherardini, wife of the Florentine merchant Francesco del Giocondo,</span></p>\r\n<p><span><strong>D.</strong> and the sitter has never been conclusively identified.</span></p>\n<ol style="list-style-type:upper-alpha"><li><p>D, C, B, A</p>\n</li><li><p>C, A, B, D</p>\n</li><li><p>B, D, A, C</p>\n</li><li><p>A, C, B, D</p>\n</li></ol>'

with open('public/data/aptitude/english/para-jumble.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print('Successfully patched APT-ENG-3421 and APT-ENG-3424 in public/data/aptitude/english/para-jumble.json')
