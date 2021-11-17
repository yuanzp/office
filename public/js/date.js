function GetNumberOfDays(date1, date2) {//获得天数
    //date1：开始日期，date2结束日期
    var a1 = Date.parse(new Date(date1));
    var a2 = Date.parse(new Date(date2));
    var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
    return day
};

//判断是不是在第几周
function inWeek(_date, week) {
    let d = new Date();
    let days = GetNumberOfDays(_date, d);
    if (week == 0)
        return days >= 0 && days <= d.getDay();
    else {
        let s = days - d.getDay();
        return s >= (week - 1) * 7 && s <= week * 7;
    }
}

module.exports={
    inWeek,
    GetNumberOfDays
}