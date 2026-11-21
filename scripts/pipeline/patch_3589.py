import json

with open('public/data/aptitude/english/para-jumble.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for item in items:
    if item['uid'] == 'APT-ENG-3589':
        item['questionHtml'] = '<p><span>Sentences of a paragraph are given below in jumbled order. Select the option that arranges the sentences in the correct logical sequence to form a meaningful and coherent paragraph.</span></p>\r\n<p><span><strong>A.</strong> Our elders are like living libraries.</span></p>\r\n<p><span><strong>B.</strong> Next time you meet your grandparents ask them about their lifestyle.</span></p>\r\n<p><span><strong>C.</strong> Some of the tips may save you a run or two to the pharmacy.</span></p>\r\n<p><span><strong>D.</strong> Ask them what homemade remedies they use and what habits they follow.</span></p>\n<ol style="list-style-type:upper-alpha"><li><p>B, D, C, A</p>\n</li><li><p>C, A, B, D</p>\n</li><li><p>A, D, B, C</p>\n</li><li><p>D, C, B, A</p>\n</li></ol>'

with open('public/data/aptitude/english/para-jumble.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

with open('data/solutions/chunks/aptitude/batches_parajumble/input_batch_27.json', 'r', encoding='utf-8') as f:
    batch = json.load(f)

for item in batch:
    if item['uid'] == 'APT-ENG-3589':
        item['question'] = 'Sentences of a paragraph are given below in jumbled order. Select the option that arranges the sentences in the correct logical sequence to form a meaningful and coherent paragraph.\nA. Our elders are like living libraries.\nB. Next time you meet your grandparents ask them about their lifestyle.\nC. Some of the tips may save you a run or two to the pharmacy.\nD. Ask them what homemade remedies they use and what habits they follow.'

with open('data/solutions/chunks/aptitude/batches_parajumble/input_batch_27.json', 'w', encoding='utf-8') as f:
    json.dump(batch, f, indent=2, ensure_ascii=False)

print('Patched successfully!')
