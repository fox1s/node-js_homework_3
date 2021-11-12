fetch('/api/result')
    .then(resp => resp.json())
    .then(data => {
        const listElement = document.getElementById('result');

        data.forEach(item => {
            let li = document.createElement('li');
            li.textContent = item;

            listElement.append(li);
        });
    });