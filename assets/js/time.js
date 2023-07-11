var testArray = ["sunny", "rainy", "sunny", "sunny", "cloudy", "cloudy", "thunderstorms", "sunny"]

function getMostFrequent(list){
  if(list){
    var freqTracker = {}
    var maxItem
    var maxCount = 1
    
    console.log(freqTracker)
    for (var i=0; i<list.length; i++){
      var item = list[i]
      console.log("🚀 ~ file: script.js:176 ~ getMostFrequent ~ item:", item)
      console.log("🚀 ~ file: time.js:13 ~ getMostFrequent ~ freqTracker[item]:", freqTracker[item])
      if(!freqTracker[item]){
        freqTracker[item] = 1
      }else{
        freqTracker[item] ++
      }
      if (freqTracker[item]>maxCount){
        maxCount = freqTracker[item]
        maxItem = item
        
      }
      console.log("🚀 ~ file: time.js:15 ~ getMostFrequent ~ freqTracker:", freqTracker)
      console.log("🚀 ~ file: time.js:22 ~ getMostFrequent ~ maxItem:", maxItem)
        console.log("🚀 ~ file: time.js:21 ~ getMostFrequent ~ maxCount:", maxCount)
      
//       if (freqTracker[item] === null){
//         freqTracker[item] = 1
//       }else{
//         freqTracker[item]++
//       }
//       if (freqTracker[item]>maxCount){
//         maxitem = item
//         maxCount = freqTracker[item]
//       }
//     }
//   }
//   console.log(maxitem)
// return maxitem
}
  }
}

getMostFrequent(testArray)