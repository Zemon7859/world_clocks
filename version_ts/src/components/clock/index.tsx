import * as React from 'react';

interface IProps {
    index: number,
    place: string,
    timezone: number,
    deleteClock: (index: number) => void
}

interface IState {

}

// 时间处理
function timeStampHandler(i: number): { date: string, time: string } {
    //参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
    if (typeof i !== 'number') {
        return {
            date: 'ERROR from timeStampHandler',
            time: 'ERROR from timeStampHandler'
        }
    }
    var d = new Date();
    //得到1970年一月一日到现在的秒数
    var len = d.getTime();
    //本地时间与GMT时间的时间偏移差
    var offset = d.getTimezoneOffset() * 60000;
    //得到现在的格林尼治时间
    var utcTime = len + offset;
    let timeObj = new Date(new Date(utcTime + 3600000 * i).getTime())
    let year = timeObj.getFullYear()
    let month = timeObj.getMonth() + 1
    let date = timeObj.getDate()
    let hour = timeObj.getHours()
    let minute = timeObj.getMinutes()
    let second = timeObj.getSeconds()
    return {
        date: `${year}-${month > 9 ? month : '0' + month}-${date > 9 ? date : '0' + date}`,
        time: `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
    }
}

class Clock extends React.Component<IProps, IState> {
    constructor(props: IProps, state: IState) {
        super(props, state)
    }

    deleteHandler(index: number) {
        this.props.deleteClock(index)
    }

    render() {
        let { place, timezone, index } = this.props
        return (
            <div className="clock">
                <div className="city">{place}</div>
                <div className="time">
                    <code>{timeStampHandler(timezone)['date']}</code>
                    <br/>
                    <code>{timeStampHandler(timezone)['time']}</code>
                </div>
                <span className="close" onClick={() => {
                    this.deleteHandler(index)
                }}>X</span>
            </div>
        )
    }
}

export default Clock;
