import os
import json
import re

# Path to the JSON file containing selectors
tags_json_path = './work/tags.json'

# Path to the directory containing HTML files
templates_dir = './templates/'

def load_selectors(json_path):
    with open(json_path, 'r') as file:
        data = json.load(file)
    return data['id_selectors'], data['class_selectors']

def remove_selectors_from_html(file_path, id_selectors, class_selectors):
    with open(file_path, 'r') as file:
        content = file.read()

    # Remove ID selectors
    for id_selector in id_selectors:
        # Remove elements with the specific ID
        content = re.sub(rf'id="{id_selector}"', '', content)

    # Remove class selectors
    for class_selector in class_selectors:
        # Remove class names from class attributes
        content = re.sub(rf'\b{class_selector}\b', '', content)

    # Clean up any extra spaces or empty class attributes
    content = re.sub(r'class="\s*"', '', content)
    content = re.sub(r'\s+', ' ', content)

    with open(file_path, 'w') as file:
        file.write(content)

def main():
    id_selectors, class_selectors = load_selectors(tags_json_path)

    for filename in os.listdir(templates_dir):
        if filename.endswith('.html'):
            file_path = os.path.join(templates_dir, filename)
            remove_selectors_from_html(file_path, id_selectors, class_selectors)
            print(f'Processed {filename}')

if __name__ == '__main__':
    main()