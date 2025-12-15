import React, {useEffect, useState} from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { getDatabases } from '../appwrite';
import { Card, Button, Text, FAB, IconButton } from 'react-native-paper';

export default function ItemList({ navigation }){
  const [items, setItems] = useState([]);

  useEffect(()=>{
    loadItems();
  },[]);

  async function loadItems(){
    try{
      const db = getDatabases();
      // list documents from `items` collection
      const res = await db.listDocuments('[DATABASE_ID]', 'items');
      setItems(res.documents || []);
    }catch(e){
      console.warn(e.message || e);
    }
  }

  return (
    <View style={{flex:1}}>
      <View style={{padding:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
        <View style={{flex:1}}>
          <Button icon="plus" mode="contained" style={{marginBottom:8}} onPress={() => navigation.navigate('AddItem')}>اضافة صنف</Button>
          <Button icon="tray-plus" mode="outlined" style={{marginBottom:8}} onPress={() => navigation.navigate('AddStock')}>اضافة مخزون</Button>
        </View>
        <View style={{marginLeft:12}}>
          <IconButton icon="cart" size={36} onPress={() => navigation.navigate('ConsumeStock')} />
          <IconButton icon="undo" size={36} onPress={() => navigation.navigate('ReturnStock')} />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.$id}
        renderItem={({item}) => (
          <Card style={styles.row} onPress={() => navigation.navigate('AddStock',{itemName:item.name})}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.$id}</Text>
            </Card.Content>
          </Card>
        )}
      />
      <FAB icon="plus" style={{position:'absolute',right:16,bottom:16}} onPress={() => navigation.navigate('AddItem')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row:{padding:12,borderBottomWidth:1,borderColor:'#eee'},
  name:{fontSize:16,fontWeight:'600', textAlign:'right'},
  meta:{color:'#666',fontSize:12, textAlign:'right'}
});
