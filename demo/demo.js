const databind = new CreateProxy(document.querySelector('#example'), {
    aaa: { q: 1 },
    bbb: '2',
    ccc: '3',
    ddd: 4,
});
document.querySelector('#plus-num').addEventListener('click', () => {
    const val = databind.ddd;
    setValue(() => {
        databind.ddd = val + 1;
    });
});
