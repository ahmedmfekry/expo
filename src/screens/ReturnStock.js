import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabases } from '../appwrite';
import { TextInput, Button, Card, Text, HelperText } from 'react-native-paper';

export default function ReturnStock({ navigation }){
  const [date] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemsList, setItemsList] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [count, setCount] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [lot, setLot] = useState('');
  const [expire, setExpire] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  async function save(){
    const e = {};
    if (!itemName.trim()) e.itemName = 'اختر الصنف';
    if (!count || Number(count) <= 0) e.count = 'ادخل عدد صحيح أكبر من صفر';
    if (!unit.trim()) e.unit = 'ادخل الوحدة';
    if (!expire || new Date(expire) <= new Date()) e.expire = 'تاريخ الانتهاء يجب أن يكون بعد اليوم';
    setErrors(e);
    if (Object.keys(e).length) return;
    try{
      const db = getDatabases();
      const payload = {
        date: date.toISOString(),
        itemName,
        count: Number(count),
        unit,
        lot,
        expire: expire.toISOString(),
        notes
      };
      await db.createDocument('[DATABASE_ID]', 'returns', undefined, payload);
      Alert.alert('تم الاضافة');
      navigation.goBack();
    }catch(e){
      Alert.alert('خطأ', e.message || String(e));
    }
  }

  useEffect(()=>{
    (async ()=>{
      try{
        const db = getDatabases();
        const res = await db.listDocuments('[DATABASE_ID]', 'items');
        setItemsList(res.documents || []);
      }catch(e){
        console.warn('load items', e.message || e);
      }
    })();
  },[]);

  function onChangeDate(event, selected){
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setExpire(selected);
  }

  return (
    <View style={styles.container}>
      <Card style={{padding:12}}>
        <Text variant="titleMedium" style={styles.label}>التاريخ</Text>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
          <TextInput mode="outlined" value={date.toLocaleDateString()} style={{flex:1,marginRight:8, textAlign:'right'}} editable={false} />
          <Button icon="calendar" mode="outlined" onPress={() => setShowDatePicker(true)}>تعديل</Button>
        </View>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

        <Text variant="titleMedium" style={styles.label}>اسم الصنف</Text>
        <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
          <TextInput mode="outlined" style={{flex:1, textAlign:'right'}} value={itemName} onChangeText={t => { setItemName(t); setErrors(prev=>({ ...prev, itemName:undefined })); }} />
          <Button icon="format-list-bulleted" mode="contained" onPress={() => setPickerVisible(true)}>قائمة</Button>
        </View>
        <HelperText type="error" visible={!!errors.itemName}>{errors.itemName}</HelperText>

        <Modal visible={pickerVisible} animationType="slide">
          <View style={{flex:1,padding:12}}>
            <Button onPress={() => setPickerVisible(false)}>اغلاق</Button>
            <FlatList
              data={itemsList}
              keyExtractor={i => i.$id}
              renderItem={({item})=> (
                <TouchableOpacity style={{padding:12,borderBottomWidth:1}} onPress={() => { setItemName(item.name); setPickerVisible(false); }}>
                  <Text style={{fontSize:16}}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        <Text variant="titleMedium" style={styles.label}>العدد</Text>
        <TextInput mode="outlined" value={count} onChangeText={t => { setCount(t); setErrors(prev=>({ ...prev, count:undefined })); }} keyboardType='numeric' style={{marginBottom:12, textAlign:'right'}} />
        <HelperText type="error" visible={!!errors.count}>{errors.count}</HelperText>
        <Text variant="titleMedium" style={styles.label}>الوحدة</Text>
        <TextInput mode="outlined" value={unit} onChangeText={t => { setUnit(t); setErrors(prev=>({ ...prev, unit:undefined })); }} style={{marginBottom:12, textAlign:'right'}} />
        <HelperText type="error" visible={!!errors.unit}>{errors.unit}</HelperText>
        <Text variant="titleMedium" style={styles.label}>LOT Number</Text>
        <TextInput mode="outlined" value={lot} onChangeText={setLot} style={{marginBottom:12, textAlign:'right'}} />
        <Text variant="titleMedium" style={styles.label}>Expire Date</Text>
        <TextInput mode="outlined" value={expire.toLocaleDateString()} editable={false} style={{marginBottom:12, textAlign:'right'}} />
        <HelperText type="error" visible={!!errors.expire}>{errors.expire}</HelperText>
        <Text variant="titleMedium" style={styles.label}>ملاحظات</Text>
        <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={{marginBottom:12, textAlign:'right'}} />
        <Button icon="content-save" mode="contained" onPress={save}>حفظ</Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16},
  input:{borderWidth:1,borderColor:'#ccc',padding:8,borderRadius:6,marginBottom:12},
  label:{marginBottom:6}
});
