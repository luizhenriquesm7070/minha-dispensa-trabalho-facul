import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [nomeItem, setNomeItem] = useState('');
  const [lista, setLista] = useState([]);

  // Busca os dados quando o app abre
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosSalvos = await AsyncStorage.getItem('@controle_estoque');
        if (dadosSalvos !== null) {
          setLista(JSON.parse(dadosSalvos));
        }
      } catch (e) {
        console.log("Erro ao carregar");
      }
    };
    carregarDados();
  }, []);

  // Salva e coloca em ordem alfabética
  const salvarNoDispositivo = async (novaLista) => {
    try {
      const listaOrdenada = novaLista.sort((a, b) => a.nome.localeCompare(b.nome));
      setLista(listaOrdenada);
      const jsonValue = JSON.stringify(listaOrdenada);
      await AsyncStorage.setItem('@controle_estoque', jsonValue);
    } catch (e) {
      console.log("Erro ao salvar");
    }
  };

  const adicionarItem = () => {
    if (nomeItem.trim().length > 0) {
      const novoObj = { id: Date.now().toString(), nome: nomeItem, qtd: 1 };
      const novaLista = [...lista, novoObj];
      salvarNoDispositivo(novaLista);
      setNomeItem('');
    }
  };

  const alterarQtd = (id, operacao) => {
    const novaLista = lista.map(item => {
      if (item.id === id) {
        const novaQtd = operacao === 'mais' ? item.qtd + 1 : Math.max(0, item.qtd - 1);
        return { ...item, qtd: novaQtd };
      }
      return item;
    });
    salvarNoDispositivo(novaLista);
  };

  const excluirItem = (id) => {
    const novaLista = lista.filter(item => item.id !== id);
    salvarNoDispositivo(novaLista);
  };

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        
        <Text style={styles.tituloApp}>Controle de Estoque</Text>
        
        <View style={styles.blocoInput}>
          <TextInput 
            style={styles.campoTexto} 
            placeholder="Nome do produto..." 
            value={nomeItem} 
            onChangeText={setNomeItem} 
          />
          <Pressable style={styles.botaoAdicionar} onPress={adicionarItem}>
            <Text style={styles.textoBotaoAdd}>ADD</Text>
          </Pressable>
        </View>

        <FlatList
          data={lista}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemLista}>
              <View style={{flex: 1}}>
                <Text style={styles.textoProduto}>{item.nome}</Text>
                <Pressable onPress={() => excluirItem(item.id)}>
                  <Text style={styles.linkExcluir}>Remover</Text>
                </Pressable>
              </View>

              <View style={styles.botoesQtd}>
                <Pressable style={styles.circuloBotao} onPress={() => alterarQtd(item.id, 'menos')}>
                  <Text style={styles.sinal}>-</Text>
                </Pressable>
                <Text style={styles.valorQtd}>{item.qtd}</Text>
                <Pressable style={styles.circuloBotao} onPress={() => alterarQtd(item.id, 'mais')}>
                  <Text style={styles.sinal}>+</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f0f0f0', padding: 20, paddingTop: 50 },
  tituloApp: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  blocoInput: { flexDirection: 'row', marginBottom: 20 },
  campoTexto: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10 },
  botaoAdicionar: { backgroundColor: '#008000', marginLeft: 10, padding: 15, borderRadius: 5, justifyContent: 'center' },
  textoBotaoAdd: { color: '#fff', fontWeight: 'bold' },
  itemLista: { backgroundColor: '#fff', padding: 15, borderRadius: 5, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#ddd' },
  textoProduto: { fontSize: 18, color: '#333' },
  linkExcluir: { color: 'red', fontSize: 12, marginTop: 5 },
  botoesQtd: { flexDirection: 'row', alignItems: 'center' },
  circuloBotao: { backgroundColor: '#eee', width: 35, height: 35, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#999' },
  sinal: { fontSize: 20, fontWeight: 'bold' },
  valorQtd: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold' }
});