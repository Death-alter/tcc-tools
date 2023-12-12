<template>
  <n-grid x-gap="12" :cols="2" :style="{ height: '100%' }">
    <n-grid-item>
      <n-space vertical>
        <n-card>
          <n-space vertical>
            <n-form
              label-placement="left"
            >
              <template v-for="(item, index) in score" :key="index">
                <n-grid :cols="24" :x-gap="24">
                  <n-form-item-gi :span="12" :label="`分数${index + 1}：`">
                    <n-input-number
                      v-model:value="item.x"
                      placeholder="请输入分数"
                      :show-button="false"
                      :keyboard="{ ArrowUp: false, ArrowDown: false }"
                      :update-value-on-input="false"
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="12" :label="`pt${index + 1}：`">
                    <n-input-number
                      v-model:value="item.y"
                      placeholder="请输入pt"
                      :show-button="false"
                      :keyboard="{ ArrowUp: false, ArrowDown: false }"
                      :update-value-on-input="false"
                    />
                  </n-form-item-gi>
                </n-grid>
              </template>
            </n-form>
            <n-a href="https://wikiwiki.jp/thscorekg" target="_blank">查询WR</n-a>
            <div>
              <n-input
                v-model:value="modelName"
                placeholder="请输入曲线名称"
                style="width: 200px; margin-right: 20px"
              ></n-input>
              <n-button type="primary" @click="createScoreCurve">生成分数曲线</n-button>
            </div>
          </n-space>
        </n-card>
        <n-card>
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="曲线名称：" label-placement="left">
              <n-select v-model:value="selectedModel" :options="selectOptions" placeholder="请选择曲线" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="输入数据：" label-placement="left">
              <n-input-number
                v-model:value="inputNumber"
                placeholder="请输入数据"
                :show-button="false"
                :keyboard="{ ArrowUp: false, ArrowDown: false }"
                :update-value-on-input="false"
                :min="0"
              />
            </n-form-item-gi>
          </n-grid>
          <div>
            <n-button type="primary" @click="calculatePt" style="margin-right: 40px">计算pt</n-button>
            <n-button type="primary" @click="calculateScore">计算分数</n-button>
          </div>
        </n-card>
        <n-card title="计算结果" size="small">
          <div style="width: 600px; text-align: left">
            <div>使用曲线：{{ result.curve }}</div>
            <div>输入数据：{{ result.input }}</div>
            <div>计算方式：{{ result.type }}</div>
            <div>计算结果：{{ result.output }}</div>
          </div>
        </n-card>
      </n-space>
    </n-grid-item>
    <n-grid-item>
      <n-data-table
        :columns="columns"
        :data="scoreCurves"
        :bordered="false"
        :style="{ background: 'white', height: '100%' }"
        flex-height
      />
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts">
import { defineComponent, h, ref, reactive, computed } from "vue";
import { ScoreModel, ScoreModelOption, Vector } from "@/utils/ScoreModel";
import Storage from "@/utils/Storage";
import {
  NFormItem,
  NForm,
  NGrid,
  NGridItem,
  NFormItemGi,
  NInput,
  NInputNumber,
  NButton,
  NDataTable,
  NCard,
  NSpace,
  NSelect,
  NA,
  useDialog,
  useMessage,
} from "naive-ui";

interface ScoreCurve {
  name: string;
  model: ScoreModel;
  score?: Vector[];
}

interface ModelData {
  name: string;
  params: ScoreModelOption;
  score?: Vector[];
}

export default defineComponent({
  name: "Home",
  components: {
    NForm,
    NGrid,
    NGridItem,
    NFormItemGi,
    NInput,
    NInputNumber,
    NButton,
    NDataTable,
    NCard,
    NSpace,
    NSelect,
    NA,
  },
  setup() {
    const dialog = useDialog();
    const message = useMessage();
    const score = reactive<Vector[]>([
      { x: 0, y: 3 },
      { x: 0, y: 30 },
      { x: 0, y: 100 },
    ]);
    const modelName = ref("");
    const selectedModel = ref<number>();
    const inputNumber = ref(0);
    const modelData: ModelData[] = Storage.local.has("modelData") ? Storage.local.get("modelData") : [];
    const scoreCurves = reactive<ScoreCurve[]>(
      modelData.map((data: ModelData) => ({
        name: data.name,
        model: new ScoreModel(data.params),
        score: data.score,
      }))
    );
    const columns = [
      {
        title: "名称",
        key: "name",
      },
      {
        title: "分数",
        key: "score",
        render(row) {
          return row.score.map((item) => h("div", {}, item.x));
        },
      },
      {
        title: "pt",
        key: "pt",
        width: 60,
        render(row) {
          return row.score.map((item) => h("div", {}, item.y));
        },
      },
      {
        title: "表达式",
        key: "f",
        width: 260,
        render(row) {
          return [
            h("div", {}, "y = ax^b + c"),
            h("div", {}, `a = ${formatNumber(row.model.a)}`),
            h("div", {}, `b = ${formatNumber(row.model.b)}`),
            h("div", {}, `c = ${formatNumber(row.model.c)}`),
          ];
        },
      },
      {
        title: "操作",
        key: "operator",
        render(row, index) {
          return h(
            NButton,
            {
              size: "small",
              type: "primary",
              onClick: () => deleteScoreCurve(index),
            },
            {
              default: () => "删除",
            }
          );
        },
      },
    ];
    const result = reactive({
      curve: "",
      input: "",
      type: "",
      output: "",
    });

    const selectOptions = computed(() =>
      scoreCurves.map((item, index) => ({
        label: item.name,
        value: index,
      }))
    );

    const saveCurveData = () => {
      Storage.local.set(
        "modelData",
        scoreCurves.map((item) => ({
          name: item.name,
          params: { a: item.model.a, b: item.model.b, c: item.model.c },
          score: item.score,
        }))
      );
    };
    const createScoreCurve = () => {
      try {
        if (!modelName.value) {
          message.warning("请输入曲线名称！");
          return;
        }
        if (scoreCurves.length >= 20) {
          message.warning("最多存在20条曲线，请删除多余曲线重试！");
          return;
        }
        const s = JSON.parse(JSON.stringify(score));
        for (let i = 0; i < scoreCurves.length; i++) {
          const curve = scoreCurves[i];
          if (curve.name === modelName.value) {
            dialog.warning({
              title: "警告",
              content: "该曲线已经存在，是否覆盖？",
              positiveText: "确定",
              negativeText: "取消",
              onPositiveClick: () => {
                scoreCurves[i] = {
                  name: modelName.value,
                  model: new ScoreModel(s),
                  score: s,
                };
              },
              onNegativeClick: () => {},
            });
            return;
          }
        }
        scoreCurves.push({
          name: modelName.value,
          model: new ScoreModel(s),
          score: s,
        });
        saveCurveData();
      } catch (err) {
        message.error("无法生成曲线，请检查数据是否正确");
      }
    };
    const deleteScoreCurve = (index) => {
      scoreCurves.splice(index, 1);
      saveCurveData();
    };
    const formatNumber = (n: number) => {
      const text = n.toString();
      const result = text.match(/^(.*)e(.*)$/);
      if (!result) {
        return text;
      } else {
        return `${result[1]}×10^${result[2]}`;
      }
    };
    const calculateScore = () => {
      if (selectedModel.value == null) {
        message.warning("请选择计算用的曲线！");
        return;
      }
      const curve = scoreCurves[selectedModel.value];
      result.curve = curve.name;
      result.input = inputNumber.value.toFixed(2);
      result.type = "计算分数";
      result.output = curve.model.inverseF(inputNumber.value).toFixed(0);
    };
    const calculatePt = () => {
      if (selectedModel.value == null) {
        message.warning("请选择计算用的曲线！");
        return;
      }
      const curve = scoreCurves[selectedModel.value];
      const output = curve.model.f(inputNumber.value);
      result.curve = curve.name;
      result.input = inputNumber.value.toFixed(0);
      result.type = "计算pt";
      result.output = output > 0 ? output.toFixed(2) : "0";
    };

    return {
      score,
      modelName,
      scoreCurves,
      columns,
      selectedModel,
      selectOptions,
      inputNumber,
      result,
      saveCurveData,
      createScoreCurve,
      deleteScoreCurve,
      calculateScore,
      calculatePt,
    };
  },
});
</script>

<style lang="scss" scoped>
.score-calculator {
  margin-top: 30px;
}
</style>
