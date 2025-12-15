import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, HelperText } from 'react-native-paper';
import { getDatabases } from '../appwrite';

export default function AddItem({ navigation }){
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);

  async function save(){
    setNameError(false);
    if (!name.trim()) { setNameError(true); return; }
    try{
      const db = getDatabases();
      // Create document in `items` collection (create the collection in Appwrite console first)
      await db.createDocument('[DATABASE_ID]', 'items', undefined, { name });
      Alert.alert('تم الحفظ');
      setName('');
      navigation.goBack();
    }catch(e){
      Alert.alert('خطأ', e.message || String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Card style={{padding:12}}>
        <Text variant="titleMedium" style={styles.label}>اسم الصنف</Text>
        <TextInput mode="outlined" value={name} onChangeText={t => { setName(t); setNameError(false); }} placeholder="مثال: اوعية دم" style={{marginBottom:6, textAlign:'right'}} />
        <HelperText type="error" visible={nameError}>الرجاء إدخال اسم الصنف</HelperText>
        <Button icon="content-save" mode="contained" onPress={save} style={{marginTop:8}}>حفظ</Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16},
  input:{borderWidth:1,borderColor:'#ccc',padding:8,borderRadius:6,marginBottom:12},
  label:{marginBottom:6}
});
