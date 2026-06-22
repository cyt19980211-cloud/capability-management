import json

with open('src/store/initialData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    start = content.find('[')
    end = content.rfind(']') + 1
    json_str = content[start:end]
    data = json.loads(json_str)

name_counts = {}
for cap in data:
    name = cap['name']
    name_counts[name] = name_counts.get(name, 0) + 1

duplicates = {name: count for name, count in name_counts.items() if count > 1}

print('重复的能力名称:')
for name, count in sorted(duplicates.items()):
    print(f'{name}: {count}次')
print(f'\n共 {len(duplicates)} 个