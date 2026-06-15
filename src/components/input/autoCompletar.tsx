import React, { useState, useEffect } from "react";

import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from "react-native";

import { supabase } from "@/lib/supabase";

interface FormularioProps {
  value: string;

  onChangeText: (text: string) => void;

  placeholder?: string;

  placeholderTextColor?: string;

  autoCapitalize?: "none" | "sentences" | "words" | "characters";

  keyboardType?: KeyboardTypeOptions;

  estiloInputExterno?: StyleProp<TextStyle>;

  estiloListaExterna?: StyleProp<ViewStyle>;

  estiloItemExterno?: StyleProp<ViewStyle>;

  estiloTextoItemExterno?: StyleProp<TextStyle>;
}

export function FormularioSelecaoNative({
  value,

  onChangeText,

  placeholder = "",

  placeholderTextColor = "#999",

  autoCapitalize = "none",

  keyboardType = "default",

  estiloInputExterno,

  estiloListaExterna,

  estiloItemExterno,

  estiloTextoItemExterno,
}: FormularioProps) {
  const [opcoes, setOpcoes] = useState<string[]>([]);

  const [mostrarLista, setMostrarLista] = useState(false);

  useEffect(() => {
    async function buscarDados() {
      const { data, error } = await supabase
        .from("tb_condominio")
        .select("codigo_acesso");

      if (error) {
        console.log(error.message);
        return;
      }

      if (data) {
        const lista = data.map((item) => item.codigo_acesso).filter(Boolean);

        setOpcoes(lista);
      }
    }

    buscarDados();
  }, []);

  // filtra conforme digita
  const opcoesFiltradas = opcoes.filter((item) => {
    if (!item) return false;

    return item.toString().toLowerCase().includes(value.toLowerCase());
  });

  return (
    <View>
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: "#999",
            borderRadius: 8,
            padding: 10,
            color: "#000",
          },

          estiloInputExterno,
        ]}
        value={value}
        onFocus={() => setMostrarLista(true)}
        onChangeText={(text) => {
          onChangeText(text);

          setMostrarLista(true);
        }}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />

      {mostrarLista && value.length > 0 && (
        <View
          style={[
            {
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginTop: 5,
              backgroundColor: "#fff",
              overflow: "hidden",
            },

            estiloListaExterna,
          ]}
        >
          {opcoesFiltradas.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                {
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                },

                estiloItemExterno,
              ]}
              onPress={() => {
                onChangeText(item);

                setMostrarLista(false);
              }}
            >
              <Text
                style={[
                  {
                    fontSize: 16,
                    color: "#000",
                  },

                  estiloTextoItemExterno,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
