import * as React from 'react';
import './App.less';
import { IClock } from './types'
import Clock from './components/clock'
import {ReactNode} from "react";
// import {number} from "prop-types";

interface IAppProps {

}

interface IAppState {
    isAdding: boolean
    // timeData: ITimeData,
    clocks: IClock[],
    cities: Array<IClock>,
    utcTimeStamp: number
}


function getLocalTime(i: number): number {
    //参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
    if (typeof i !== 'number') {
        return 0
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

class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps, state: IAppState) {
        super(props, state)
        let clocks_localStorage = JSON.parse(localStorage.getItem('world_clocks_data') || "[]")
        // let timeData: ITimeData
        // clocks_localStorage.forEach((data: IClock) => {
        //     timeData[data.place] = {
        //         timeStamp: getLocalTime(data.timezone)
        //     }
        // })
        this.state = {
            isAdding: false,
            utcTimeStamp: getLocalTime(0),
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

    // 添加时钟
    addClock(item: IClock): void {
        // e.nativeEvent.stopImmediatePropagation()
        // e.stopPropagation()
        let clocks = JSON.parse(JSON.stringify(this.state.clocks))
        // let timeData = JSON.parse(JSON.stringify(this.state.timeData))
        // if (!timeData[item.place]) {
        //     timeData[item.place] = {
        //         timeStamp: getLocalTime(item.timezone)
        //     }
        // }
        clocks.push(item)
        this.setState({
            clocks,
            // timeData,
            isAdding: false
        })
        // 更新本地缓存
        localStorage.setItem('world_clocks_data', JSON.stringify(clocks))
    }

    // 删除时钟
    deleteClock(index: number): void {
        let clocks = JSON.parse(JSON.stringify(this.state.clocks))
        clocks.splice(index, 1)
        // 更新本地缓存
        localStorage.setItem('world_clocks_data', JSON.stringify(clocks))
        this.setState({
            clocks
        })
    }

    // 显示时钟选项
    showSelection() {
        // e.nativeEvent.stopImmediatePropagation()
        // e.stopPropagation()
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
    renderSelection(): React.ReactNode {
        const { cities } = this.state
        let selections: Array<React.ReactNode> = []

        cities.forEach((item, index) => {
            selections.push(
                <li className="selections" key={index} onClick={() => {this.addClock(item)}}>{item.place}</li>
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
        const { clocks } = this.state
        let column = document.body.offsetWidth < 1440 ? 3 : 4
        const remainder: number | boolean = clocks.length > 0 && (column - clocks.length % column - 1)
        return (
            <div className="App">
                <div className="block">
                    {
                        clocks.map((clock: IClock, index: number) => (
                            <Clock
                                key = {'clock' + index}
                                index = {index}
                                place = {clock.place}
                                timezone = {clock.timezone}
                                deleteClock = { (index: number) => this.deleteClock(index)}
                            />
                        ))
                    }
                    <div className="clock add">
                        <div className="city add-symbol" onClick={() => {this.showSelection()}}>
                            +
                            {
                                this.state.isAdding ?
                                    this.renderSelection() : null
                            }
                        </div>
                        <div className="time">--</div>
                    </div>
                    {
                        remainder ? this.renderFillingDom(remainder) : null
                    }
                </div>
            </div>
        )
    }
}

export default App;
