import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SharedYoutubeLinkContext } from './_layout';

const MOCK_DEVICES = [
  { id: '1', name: 'Piano-Bluetooth-01' },
  { id: '2', name: 'Speaker-02' },
  { id: '3', name: 'MyHeadset' },
];

// 유튜브 링크에서 영상 ID 추출 함수
function extractYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function BluetoothScreen() {
  const { link: sharedLink, setLink: setSharedLink } = useContext(SharedYoutubeLinkContext);
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<{id: string, name: string} | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('');

  // 썸네일 URL 생성
  const videoId = extractYoutubeId(sharedLink ?? '');
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

  // sharedLink 변화 감지 로그
  useEffect(() => {
    console.log('sharedLink 변경 감지:', sharedLink);
  }, [sharedLink]);

  // 입력란이 바뀌면 Context도 동기화
  const handleInputChange = (text: string) => {
    setSharedLink(text);
  };

  // 블루투스 기기 검색(모킹)
  const scanDevices = () => {
    setStatus('기기 검색 완료!');
    setDevices(MOCK_DEVICES); // 실제 구현시 BLE 스캔 결과로 대체
  };

  // 링크 전송(모킹)
  const sendLink = () => {
    if (!sharedLink || !selectedDevice) {
      Alert.alert('알림', '유튜브 링크와 기기를 모두 선택하세요.');
      return;
    }
    setIsSending(true);
    setStatus('링크 전송 중...');
    setTimeout(() => {
      setIsSending(false);
      setStatus('링크 전송 성공!');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {thumbnailUrl && (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
      <Text style={styles.title}>유튜브 링크를 입력하세요</Text>
      <TextInput
        style={styles.input}
        placeholder="https://youtube.com/..."
        value={sharedLink ?? ''}
        onChangeText={handleInputChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="블루투스 기기 검색" onPress={scanDevices} />
      <Text style={styles.subtitle}>기기 선택</Text>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.device, selectedDevice?.id === item.id && styles.selectedDevice]}
            onPress={() => setSelectedDevice(item)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 120 }}
      />
      <Button title="링크 전송" onPress={sendLink} disabled={isSending} />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  thumbnail: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  device: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 6 },
  selectedDevice: { backgroundColor: '#e0f7fa' },
  status: { marginTop: 18, fontSize: 16, color: '#00796b', fontWeight: 'bold' },
}); 