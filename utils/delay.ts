export default function (time: number) {
    return new Promise((res) => {
        setTimeout(res, time);
    });
}
