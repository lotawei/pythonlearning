import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import "./styles.less"
import  {Button, Modal} from "antd";

interface  ItemData {
      name?: string;
      age?: number;
}

const IndexPage = () => {
  const  [count, setCount] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
  const  [listData,setListData] = useState<ItemData[]>([{name:"王阳明",age:19},{name:"王收人",age:18}]);
  const handerClick = () =>{
    console.log("hellow")
    setCount(count + 1)
  }
  const addItem = (name:string, age: number) => {
    setListData([...listData, { name: name, age: age }]);
  };
  const findItem = (name: string) => {
    const item = listData.find(item => item.name === name);
    return item
  };

  const updateItem = (index: number, newItem: ItemData) => {
    if (index >= 0 && index < listData.length) {
      let newListData = [...listData];
      newListData[index] = newItem;
      setListData(newListData);
    }
  };
  const resetData = () => {
      setListData([{name:"王阳明",age:19},{name:"王收人",age:18}])
  }
  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const deleteItem = (index: number) => {
    setListData(listData.filter((_, i) => i !== index));
  };
  
  const changeName = () =>{
      //增删查改
      setTimeout(() => {
        addItem("测试的",17)
      }, 2000);
      setTimeout(() => {
        findItem("测试的")
      }, 3000);
      setTimeout(() => {
        updateItem(0,{name:"udpdate",age:16})
      }, 3000);
      setTimeout(() => {
        if (listData.length >= 1){
          deleteItem(0)
        }
        
      }, 3000);
    
  }

  useEffect(() => {
    // 在这里编写动画效果的代码
    const animation = () => {
      // 示例：将count值从0递增到100
      let currentCount = 0;
      const timer = setInterval(() => {
        currentCount++;
        setCount(currentCount);
        if (currentCount === 2000) {
          clearInterval(timer);
        }
      }, 1000);
    };

    // 在这里调用动画效果函数
    animation();
  }, []);

  return (
    <>
    <div className={classNames('lesscontainer')}>
      {<Button onClick={handerClick} type='primary'>点击我测试</Button>}
      {<span>count: {count}</span>}
    </div>
    <div>
      {
         listData.map((item: ItemData, index: number) => {
            return (
              <div key={index}>
                <span>Name: {item.name}</span>
                <span>Age: {item.age}</span>
              </div>
            );
         })
      }
    </div>
    <div>
    {<Button onClick={changeName} type='primary'>改名字</Button>}
    {<Button onClick={resetData} type='primary'>重置</Button>}
    <br/>
     {<span>{JSON.stringify(findItem("udpdate"))}</span>}
    </div>
    <div>
        <Button onClick={showModal} type="primary">
          Open Modal
      </Button>
    </div>
    {/* 弹窗组件使用 */}
    <Modal
          title="Basic Modal"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
   
    </>
  );
};

export default IndexPage;
