/**
 * return array after adding delimiter default delimiter is ','
 * @param {*} arr
 * @param {*} delimiter
 */

/*    Description Table
   ________________________________________________________________________________
   | No |   Name       |   Type     |  Default   |  Explanation                    |
   |____|______________|____________|____________|_________________________________|
   |    |              |            |            |                                 |
   | 1  |   arr        |   Array    |  undefined |  Array to be processed          |
   |____|______________|____________|____________|_________________________________|
   | 2  |   delimiter  |   String   |    ,       | Delimiter to add                |
   |____|______________|____________|____________|_________________________________|

*/

export const addSeparator = (arr, delimiter = ',') => {
    if (arr.length > 1) {
        for (let i = 0; i < arr.length - 1; i++) {
            arr[i].label = arr[i].label + delimiter;
        }
    }
    return arr;
};
