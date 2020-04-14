/**
 * @file 世界时钟
 */


import * as React from 'react';
import './App.less';

let count = 0 // 计数变量，用于判断是否发起时间同步请求

// 获取各时区时间
function getLocalTime(i: number): number {
    //参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
    if (typeof i !== 'number') {
        return
    }
    var d = new Date();
    //得到1970年一月一日到现在的秒数
    var len = d.getTime();
    //本地时间与GMT时间的时间偏移差
    var offset = d.getTimezoneOffset() * 60000;
    //得到现在的格林尼治时间
    var utcTime = len + offset;
    return new Date(utcTime + 3600000 * i).getTime();
}

// 时间处理
function timeStampHandler(timeStamp: number): object {
    let timeObj = new Date(timeStamp)
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

// interface IValueObject {
//     [key: string]: any
// }

interface IAppProps {

}

interface IAppState {
    isAdding: boolean
    timeData: object,
    clocks: any,
    cities: Array<any>
}

class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps, state: IAppState) {
        super(props, state)
        let clocks_localStorage = JSON.parse(localStorage.getItem('world_clocks_data') || "[]")
        let timeData = {}
        // for (let data of clocks_localStorage) {
        //     timeData[data.place] = {
        //         timeStamp: getLocalTime(data.timezone)
        //     }
        // }
        clocks_localStorage.forEach((data) => {
            timeData[data.place] = {
                timeStamp: getLocalTime(data.timezone)
            }
        })
        this.state = {
            isAdding: false,
            timeData,
            clocks: clocks_localStorage || [],
            cities: [
                {
                    place: 'London',
                    timezone: 0
                },
                {
                    place: 'China',
                    timezone: 8
                },
                {
                    place: 'Iraq',
                    timezone: 3
                },
                {
                    place: 'France',
                    timezone: 1
                }
            ]
        }
    }

    componentDidMount() {
        setInterval(async () => {
            let clocks_localStorage = JSON.parse(localStorage.getItem('world_clocks_data'))
            this.setState({
                clocks: clocks_localStorage || []
            })
            this.updateTimeData(this.state.clocks)
            if (count === 60) {
                count = 0
                let res: any = await this.getTime(this.state.clocks);
                if (res.code === 800) {
                    this.setState({
                        timeData: res.data
                    })
                }
            } else {
                this.localRefreshTime()
                count++
            }
        }, 1000)
    }

    // 更新时间对象
    updateTimeData(clocks: object[]) {
        let timeData = {}
        // for (let data of clocks) {
        //     timeData[data.place] = {
        //         timeStamp: getLocalTime(data.timezone)
        //     }
        // }
        clocks.forEach((data: any) => {
            timeData[data.place] = {
                timeStamp: getLocalTime(data.timezone)
            }
        })
        this.setState({
            timeData
        })
    }

    // 模拟获取时间异步请求
    async getTime(clocks: object[]) {
        return new Promise(resolve => setTimeout(() => {
            let reqError = Math.random() <= 0.3
            if (reqError) {
                resolve({
                    code: 400,
                    error: '请求出错'
                })
            } else {
                let timeData = {}
                clocks.forEach((data: any) => {
                    timeData[data.place] = {
                        timeStamp: getLocalTime(data.timezone)
                    }
                })
                resolve({
                    code: 800,
                    data: timeData
                })
            }
        }, 800))
    }

    // 添加时钟
    addClock(e, item: any): void {
        e.nativeEvent.stopImmediatePropagation()
        e.stopPropagation()
        let clocks = JSON.parse(JSON.stringify(this.state.clocks))
        let timeData = JSON.parse(JSON.stringify(this.state.timeData))
        if (!timeData[item.place]) {
            timeData[item.place] = {
                timeStamp: getLocalTime(item.timezone)
            }
        }
        clocks.push(item)
        this.setState({
            clocks,
            timeData,
            isAdding: false
        })
        // 更新本地缓存
        localStorage.setItem('world_clocks_data', JSON.stringify(clocks))
    }

    // 本地按秒自动更新时间
    localRefreshTime(): void {
        let timeData = JSON.parse(JSON.stringify(this.state.timeData))
        for (let place in timeData) {
            timeData[place].timeStamp += 1000
        }
        this.setState({
            timeData
        })
    }


    // 删除时钟
    deleteClock(index): void {
        let clocks = JSON.parse(JSON.stringify(this.state.clocks))
        clocks.splice(index, 1)
        // 更新本地缓存
        localStorage.setItem('world_clocks_data', JSON.stringify(clocks))
        this.setState({
            clocks
        })
    }

    // 显示时钟选项
    showSelection(e): void{
        e.nativeEvent.stopImmediatePropagation()
        e.stopPropagation()
        this.setState({
            isAdding: true
        })
    }

    // 渲染行内补充元素保证布局整齐
    renderFillingDom(count: number) {
        let dom = []
        for (let i = 0; i < count; i++) {
            dom.push(
                <div className="clock filling-dom" key={i}></div>
            )
        }
        return dom
    }

    // 渲染下拉列表 选择时区
    renderSelection() {
        const {cities} = this.state
        let selections = []

        cities.forEach((item, index) => {
            selections.push(
                <li className="selections" key={index} onClick={(e) => {this.addClock(e, item)}}>{item.place}</li>
            )
        })

        return (
            <ul className="selector-timezone">
                {
                    selections
                }
            </ul>
        )
    }

    render() {
        const {clocks, timeData} = this.state
        let column = document.body.offsetWidth < 1500 ? 3 : 4
        const remainder = clocks.length > 0 && (column - clocks.length % column - 1)
        return (
            <div className="App" onClick={() => {this.setState({isAdding: false})}}>
            <div className="table">
                <div className="block">
                    {
                        clocks.map((item, index) => (
                            <div className="clock" key={index}>
                        <div className="city">{item.place}</div>
                            <div className="time">
                        <code>{timeStampHandler(timeData[item.place].timeStamp)['date']}</code>
                            <br/>
                            <code>{timeStampHandler(timeData[item.place].timeStamp)['time']}</code>
                            </div>
                            <span className="close" onClick={() => {
                                this.deleteClock(index)
                            }}>X</span>
                            </div>
                        ))
                    }
                <div className="clock add">
                    <div className="city add-symbol" onClick={(e) => {this.showSelection(e)}}>
                        +
                        {
                            this.state.isAdding ?
                                this.renderSelection() : null
                        }
                    </div>
                    <div className="time">--</div>
                </div>
                {
                    remainder > 0 ? this.renderFillingDom(remainder) : null
                }
                </div>
            </div>
        </div>
    )
    }
}

export default App;
